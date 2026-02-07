package handlers

import (
	"database/sql"
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
		INSERT INTO companies (name, description, website, logo_url, recruiter_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, description, website, logo_url, recruiter_id, created_at, updated_at
	`
	err := config.DB.QueryRow(query, req.Name, req.Description, req.Website, req.LogoURL, recruiterID).
		Scan(&company.ID, &company.Name, &company.Description, &company.Website, &company.LogoURL,
			&company.RecruiterID, &company.CreatedAt, &company.UpdatedAt)

	if err != nil {
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
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $5
		RETURNING id, name, description, website, logo_url, recruiter_id, created_at, updated_at
	`

	var company models.Company
	err = config.DB.QueryRow(query, req.Name, req.Description, req.Website, req.LogoURL, companyID).
		Scan(&company.ID, &company.Name, &company.Description, &company.Website, &company.LogoURL,
			&company.RecruiterID, &company.CreatedAt, &company.UpdatedAt)

	if err != nil {
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
		SELECT id, name, description, website, logo_url, recruiter_id, created_at, updated_at
		FROM companies WHERE id = $1
	`
	err := config.DB.QueryRow(query, companyID).
		Scan(&company.ID, &company.Name, &company.Description, &company.Website, &company.LogoURL,
			&company.RecruiterID, &company.CreatedAt, &company.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, company)
}
