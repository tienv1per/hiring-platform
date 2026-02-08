package handlers

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/job-service/config"
	"github.com/job-portal/job-service/models"
)

// CreateCompany creates a new company (recruiters only)
func CreateCompany(c *gin.Context) {
	recruiterID := c.GetString("user_id")

	var req models.CreateCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var company models.Company
	query := `
		INSERT INTO companies (name, description, website, logo_url, recruiter_id, industry, company_size, founded_year, headquarters)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, name, description, website, logo_url, recruiter_id, industry, company_size, founded_year, headquarters, rating, created_at, updated_at
	`
	err := config.DB.QueryRow(query, req.Name, req.Description, req.Website, req.LogoURL, recruiterID,
		req.Industry, req.CompanySize, req.FoundedYear, req.Headquarters).
		Scan(&company.ID, &company.Name, &company.Description, &company.Website, &company.LogoURL,
			&company.RecruiterID, &company.Industry, &company.CompanySize, &company.FoundedYear, &company.Headquarters,
			&company.Rating, &company.CreatedAt, &company.UpdatedAt)

	if err != nil {
		log.Printf("Failed to create company: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create company"})
		return
	}

	c.JSON(http.StatusCreated, company)
}

// UpdateCompany updates company information
func UpdateCompany(c *gin.Context) {
	companyID := c.Param("id")
	recruiterID := c.GetString("user_id")

	// Check ownership
	var ownerID string
	err := config.DB.QueryRow("SELECT recruiter_id FROM companies WHERE id = $1", companyID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if ownerID != recruiterID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own companies"})
		return
	}

	var req models.UpdateCompanyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		UPDATE companies
		SET name = COALESCE(NULLIF($1, ''), name),
		    description = COALESCE(NULLIF($2, ''), description),
		    website = COALESCE(NULLIF($3, ''), website),
		    logo_url = COALESCE(NULLIF($4, ''), logo_url),
		    industry = COALESCE(NULLIF($5, ''), industry),
		    company_size = COALESCE(NULLIF($6, ''), company_size),
		    founded_year = COALESCE(NULLIF($7, 0), founded_year),
		    headquarters = COALESCE(NULLIF($8, ''), headquarters),
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $9
		RETURNING id, name, description, website, logo_url, recruiter_id, industry, company_size, founded_year, headquarters, rating, created_at, updated_at
	`

	var company models.Company
	err = config.DB.QueryRow(query, req.Name, req.Description, req.Website, req.LogoURL,
		req.Industry, req.CompanySize, req.FoundedYear, req.Headquarters,
		companyID).
		Scan(&company.ID, &company.Name, &company.Description, &company.Website, &company.LogoURL,
			&company.RecruiterID, &company.Industry, &company.CompanySize, &company.FoundedYear, &company.Headquarters,
			&company.Rating, &company.CreatedAt, &company.UpdatedAt)

	if err != nil {
		log.Printf("Failed to update company: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update company"})
		return
	}

	c.JSON(http.StatusOK, company)
}

// DeleteCompany deletes a company
func DeleteCompany(c *gin.Context) {
	companyID := c.Param("id")
	recruiterID := c.GetString("user_id")

	// Check ownership
	var ownerID string
	err := config.DB.QueryRow("SELECT recruiter_id FROM companies WHERE id = $1", companyID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if ownerID != recruiterID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own companies"})
		return
	}

	result, err := config.DB.Exec("DELETE FROM companies WHERE id = $1", companyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete company"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Company deleted successfully"})
}

// GetCompany retrieves company details
func GetCompany(c *gin.Context) {
	companyID := c.Param("id")

	var company models.Company
	query := `
		SELECT id, name, description, website, logo_url, recruiter_id, industry, company_size, founded_year, headquarters, rating, created_at, updated_at
		FROM companies WHERE id = $1
	`
	err := config.DB.QueryRow(query, companyID).
		Scan(&company.ID, &company.Name, &company.Description, &company.Website, &company.LogoURL,
			&company.RecruiterID, &company.Industry, &company.CompanySize, &company.FoundedYear, &company.Headquarters,
			&company.Rating, &company.CreatedAt, &company.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, company)
}

// GetCompanies lists all companies for the authenticated recruiter
func GetCompanies(c *gin.Context) {
	recruiterID := c.GetString("user_id")

	// Log for debugging
	log.Printf("GetCompanies called with recruiter_id: %s", recruiterID)

	// If no recruiter ID, return empty list (not an error)
	if recruiterID == "" {
		log.Printf("GetCompanies: no recruiter_id in context, returning empty list")
		c.JSON(http.StatusOK, gin.H{"companies": []models.Company{}})
		return
	}

	query := `
		SELECT id, name, description, website, logo_url, recruiter_id, industry, company_size, founded_year, headquarters, rating, created_at, updated_at
		FROM companies
		WHERE recruiter_id = $1
		ORDER BY created_at DESC
	`
	rows, err := config.DB.Query(query, recruiterID)
	if err != nil {
		log.Printf("GetCompanies: database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var companies []models.Company
	for rows.Next() {
		var company models.Company
		if err := rows.Scan(&company.ID, &company.Name, &company.Description, &company.Website, &company.LogoURL,
			&company.RecruiterID, &company.Industry, &company.CompanySize, &company.FoundedYear, &company.Headquarters,
			&company.Rating, &company.CreatedAt, &company.UpdatedAt); err != nil {
			log.Printf("GetCompanies: scan error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan company"})
			return
		}
		companies = append(companies, company)
	}

	log.Printf("GetCompanies: returning %d companies for recruiter %s", len(companies), recruiterID)
	c.JSON(http.StatusOK, gin.H{"companies": companies})
}
