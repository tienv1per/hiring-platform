package handlers

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/job-service/config"
)

// AdminRecruiter represents a recruiter user for admin views
type AdminRecruiter struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Email         string `json:"email"`
	Phone         string `json:"phone"`
	ProfilePicURL string `json:"profile_pic_url"`
	CompanyCount  int    `json:"company_count"`
}

// AdminCompany represents a company with recruiter info for admin views
type AdminCompany struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	Description    string  `json:"description"`
	Website        string  `json:"website"`
	LogoURL        string  `json:"logo_url"`
	Industry       string  `json:"industry"`
	CompanySize    string  `json:"company_size"`
	Headquarters   string  `json:"headquarters"`
	Rating         float64 `json:"rating"`
	RecruiterID    string  `json:"recruiter_id"`
	RecruiterName  string  `json:"recruiter_name"`
	RecruiterEmail string  `json:"recruiter_email"`
	JobCount       int     `json:"job_count"`
	CreatedAt      string  `json:"created_at"`
}

// AssignCompanyRequest is the request body for assigning a company to a recruiter
type AssignCompanyRequest struct {
	RecruiterID string `json:"recruiter_id" binding:"required"`
}

// GetAdminStats returns admin dashboard statistics
func GetAdminStats(c *gin.Context) {
	var totalUsers, totalRecruiters, totalCompanies, unassignedCompanies, totalJobs int

	config.DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&totalUsers)
	config.DB.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'recruiter'").Scan(&totalRecruiters)
	config.DB.QueryRow("SELECT COUNT(*) FROM companies").Scan(&totalCompanies)
	config.DB.QueryRow("SELECT COUNT(*) FROM companies WHERE recruiter_id IS NULL OR recruiter_id = ''").Scan(&unassignedCompanies)
	config.DB.QueryRow("SELECT COUNT(*) FROM jobs").Scan(&totalJobs)

	c.JSON(http.StatusOK, gin.H{
		"total_users":          totalUsers,
		"total_recruiters":     totalRecruiters,
		"total_companies":      totalCompanies,
		"unassigned_companies": unassignedCompanies,
		"total_jobs":           totalJobs,
	})
}

// GetAdminRecruiters lists all recruiters with their company count
func GetAdminRecruiters(c *gin.Context) {
	query := `
		SELECT u.id, u.name, u.email, COALESCE(u.phone, ''), COALESCE(u.profile_pic_url, ''),
		       COALESCE(cc.cnt, 0) as company_count
		FROM users u
		LEFT JOIN (
			SELECT recruiter_id, COUNT(*) as cnt
			FROM companies
			GROUP BY recruiter_id
		) cc ON u.id = cc.recruiter_id
		WHERE u.role = 'recruiter'
		ORDER BY u.name ASC
	`
	rows, err := config.DB.Query(query)
	if err != nil {
		log.Printf("GetAdminRecruiters: database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var recruiters []AdminRecruiter
	for rows.Next() {
		var r AdminRecruiter
		if err := rows.Scan(&r.ID, &r.Name, &r.Email, &r.Phone, &r.ProfilePicURL, &r.CompanyCount); err != nil {
			log.Printf("GetAdminRecruiters: scan error: %v", err)
			continue
		}
		recruiters = append(recruiters, r)
	}

	if recruiters == nil {
		recruiters = []AdminRecruiter{}
	}

	c.JSON(http.StatusOK, gin.H{"recruiters": recruiters})
}

// GetAdminCompanies lists all companies with recruiter info and job counts
func GetAdminCompanies(c *gin.Context) {
	query := `
		SELECT c.id, c.name, COALESCE(c.description, ''), COALESCE(c.website, ''), COALESCE(c.logo_url, ''),
		       COALESCE(c.industry, ''), COALESCE(c.company_size, ''), COALESCE(c.headquarters, ''),
		       COALESCE(c.rating, 0), COALESCE(c.recruiter_id::text, ''),
		       COALESCE(u.name, 'Unassigned'), COALESCE(u.email, ''),
		       COALESCE(jc.cnt, 0), c.created_at
		FROM companies c
		LEFT JOIN users u ON c.recruiter_id IS NOT NULL AND c.recruiter_id = u.id
		LEFT JOIN (
			SELECT company_id, COUNT(*) as cnt
			FROM jobs
			GROUP BY company_id
		) jc ON c.id = jc.company_id
		ORDER BY c.name ASC
	`
	rows, err := config.DB.Query(query)
	if err != nil {
		log.Printf("GetAdminCompanies: database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var companies []AdminCompany
	for rows.Next() {
		var comp AdminCompany
		if err := rows.Scan(&comp.ID, &comp.Name, &comp.Description, &comp.Website, &comp.LogoURL,
			&comp.Industry, &comp.CompanySize, &comp.Headquarters, &comp.Rating, &comp.RecruiterID,
			&comp.RecruiterName, &comp.RecruiterEmail, &comp.JobCount, &comp.CreatedAt); err != nil {
			log.Printf("GetAdminCompanies: scan error: %v", err)
			continue
		}
		companies = append(companies, comp)
	}

	if companies == nil {
		companies = []AdminCompany{}
	}

	c.JSON(http.StatusOK, gin.H{"companies": companies})
}

// AssignCompanyToRecruiter assigns or reassigns a company to a recruiter
func AssignCompanyToRecruiter(c *gin.Context) {
	companyID := c.Param("id")

	var req AssignCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify the company exists
	var companyName string
	err := config.DB.QueryRow("SELECT name FROM companies WHERE id = $1", companyID).Scan(&companyName)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Verify the recruiter exists and has the recruiter role
	var recruiterName, recruiterRole string
	err = config.DB.QueryRow("SELECT name, role FROM users WHERE id = $1", req.RecruiterID).Scan(&recruiterName, &recruiterRole)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Recruiter not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if recruiterRole != "recruiter" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User is not a recruiter"})
		return
	}

	// Update the company's recruiter_id
	_, err = config.DB.Exec(
		"UPDATE companies SET recruiter_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
		req.RecruiterID, companyID,
	)
	if err != nil {
		log.Printf("AssignCompanyToRecruiter: update error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign company"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "Company assigned successfully",
		"company_name":   companyName,
		"recruiter_name": recruiterName,
	})
}
