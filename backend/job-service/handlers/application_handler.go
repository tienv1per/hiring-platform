package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/job-service/config"
	"github.com/job-portal/job-service/models"
)

// ApplyToJob creates a new job application
func ApplyToJob(c *gin.Context) {
	applicantID := c.GetString("user_id")

	var req models.ApplyJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if job exists and is active
	var jobStatus string
	err := config.DB.QueryRow("SELECT status FROM jobs WHERE id = $1", req.JobID).Scan(&jobStatus)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if jobStatus != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This job is no longer accepting applications"})
		return
	}

	// Check for duplicate application
	var existingID string
	err = config.DB.QueryRow("SELECT id FROM applications WHERE job_id = $1 AND applicant_id = $2", req.JobID, applicantID).Scan(&existingID)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already applied to this job"})
		return
	} else if err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Create application
	var application models.Application
	query := `
		INSERT INTO applications (job_id, applicant_id, email, resume_url, cover_letter, subscribed)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, job_id, applicant_id, email, resume_url, cover_letter, status, subscribed, applied_at, updated_at
	`
	err = config.DB.QueryRow(query, req.JobID, applicantID, req.Email, req.ResumeURL, req.CoverLetter, req.Subscribed).
		Scan(&application.ID, &application.JobID, &application.ApplicantID, &application.Email,
			&application.ResumeURL, &application.CoverLetter, &application.Status, &application.Subscribed,
			&application.AppliedAt, &application.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit application"})
		return
	}

	// TODO: Send email notification via Kafka
	// kafka.ProduceEvent("application-submitted", application)

	c.JSON(http.StatusCreated, gin.H{
		"message":     "Application submitted successfully",
		"application": application,
	})
}

// GetMyApplications retrieves all applications by the authenticated user
func GetMyApplications(c *gin.Context) {
	applicantID := c.GetString("user_id")

	query := `
		SELECT a.id, a.job_id, a.applicant_id, a.email, a.resume_url, a.cover_letter, a.status, a.subscribed, a.applied_at, a.updated_at,
		       j.title as job_title, co.name as company_name
		FROM applications a
		JOIN jobs j ON a.job_id = j.id
		JOIN companies co ON j.company_id = co.id
		WHERE a.applicant_id = $1
		ORDER BY a.applied_at DESC
	`

	rows, err := config.DB.Query(query, applicantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	applications := []models.Application{}
	for rows.Next() {
		var app models.Application
		err := rows.Scan(&app.ID, &app.JobID, &app.ApplicantID, &app.Email, &app.ResumeURL, &app.CoverLetter,
			&app.Status, &app.Subscribed, &app.AppliedAt, &app.UpdatedAt, &app.JobTitle, &app.CompanyName)
		if err != nil {
			continue
		}
		applications = append(applications, app)
	}

	c.JSON(http.StatusOK, applications)
}

// UpdateApplicationStatus updates application status (recruiters only)
func UpdateApplicationStatus(c *gin.Context) {
	applicationID := c.Param("id")
	recruiterID := c.GetString("user_id")

	var req models.UpdateApplicationStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify recruiter owns the job
	var jobRecruiterID string
	query := `
		SELECT j.recruiter_id
		FROM applications a
		JOIN jobs j ON a.job_id = j.id
		WHERE a.id = $1
	`
	err := config.DB.QueryRow(query, applicationID).Scan(&jobRecruiterID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Application not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if jobRecruiterID != recruiterID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update applications for your own jobs"})
		return
	}

	// Update status
	var application models.Application
	updateQuery := `
		UPDATE applications
		SET status = $1, updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
		RETURNING id, job_id, applicant_id, email, resume_url, cover_letter, status, subscribed, applied_at, updated_at
	`
	err = config.DB.QueryRow(updateQuery, req.Status, applicationID).
		Scan(&application.ID, &application.JobID, &application.ApplicantID, &application.Email,
			&application.ResumeURL, &application.CoverLetter, &application.Status, &application.Subscribed,
			&application.AppliedAt, &application.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update application status"})
		return
	}

	// TODO: Send status update notification via Kafka
	// if application.Subscribed {
	//     kafka.ProduceEvent("application-status-changed", application)
	// }

	c.JSON(http.StatusOK, application)
}
