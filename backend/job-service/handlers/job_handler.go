package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/job-service/config"
	"github.com/job-portal/job-service/models"
	"github.com/lib/pq"
)

// CreateJob creates a new job posting with markdown description
func CreateJob(c *gin.Context) {
	recruiterID := c.GetString("user_id")

	var req models.CreateJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify company ownership
	var ownerID string
	err := config.DB.QueryRow("SELECT recruiter_id FROM companies WHERE id = $1", req.CompanyID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Company not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if ownerID != recruiterID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only post jobs for your own companies"})
		return
	}

	var job models.Job
	query := `
		INSERT INTO jobs (title, description, salary, location, job_type, work_location, openings, required_skills, company_id, recruiter_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, title, description, salary, location, job_type, work_location, openings, required_skills, company_id, recruiter_id, status, created_at, updated_at
	`
	err = config.DB.QueryRow(query, req.Title, req.Description, req.Salary, req.Location, req.JobType,
		req.WorkLocation, req.Openings, pq.Array(req.RequiredSkills), req.CompanyID, recruiterID).
		Scan(&job.ID, &job.Title, &job.Description, &job.Salary, &job.Location, &job.JobType,
			&job.WorkLocation, &job.Openings, pq.Array(&job.RequiredSkills), &job.CompanyID,
			&job.RecruiterID, &job.Status, &job.CreatedAt, &job.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create job"})
		return
	}

	// Generate and save embedding asynchronously
	go func() {
		if err := generateJobEmbedding(job.ID, job.Title); err != nil {
			log.Printf("Failed to generate embedding for job %s: %v", job.ID, err)
		} else {
			log.Printf("✅ Generated embedding for job: %s", job.Title)
		}
	}()

	c.JSON(http.StatusCreated, job)
}

// UpdateJob updates job posting
func UpdateJob(c *gin.Context) {
	jobID := c.Param("id")
	recruiterID := c.GetString("user_id")

	// Check ownership
	var ownerID string
	err := config.DB.QueryRow("SELECT recruiter_id FROM jobs WHERE id = $1", jobID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if ownerID != recruiterID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own jobs"})
		return
	}

	var req models.UpdateJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Build dynamic update query
	// Note: job_type and work_location are ENUM types, so we use CASE WHEN instead of COALESCE
	query := `
		UPDATE jobs
		SET title = COALESCE(NULLIF($1, ''), title),
		    description = COALESCE(NULLIF($2, ''), description),
		    salary = COALESCE(NULLIF($3, ''), salary),
		    location = COALESCE(NULLIF($4, ''), location),
		    job_type = CASE WHEN $5 = '' THEN job_type ELSE $5::job_type END,
		    work_location = CASE WHEN $6 = '' THEN work_location ELSE $6::work_location END,
		    openings = CASE WHEN $7 = 0 THEN openings ELSE $7 END,
		    status = CASE WHEN $8 = '' THEN status ELSE $8::job_status END,
		    required_skills = $9,
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $10
		RETURNING id, title, description, salary, location, job_type, work_location, openings, required_skills, company_id, recruiter_id, status, created_at, updated_at
	`

	var job models.Job
	// Always use pq.Array for skills - pass empty array if no skills provided
	skills := pq.Array(req.RequiredSkills)

	err = config.DB.QueryRow(query, req.Title, req.Description, req.Salary, req.Location, req.JobType,
		req.WorkLocation, req.Openings, req.Status, skills, jobID).
		Scan(&job.ID, &job.Title, &job.Description, &job.Salary, &job.Location, &job.JobType,
			&job.WorkLocation, &job.Openings, pq.Array(&job.RequiredSkills), &job.CompanyID,
			&job.RecruiterID, &job.Status, &job.CreatedAt, &job.UpdatedAt)

	if err != nil {
		log.Printf("UpdateJob error for job %s: %v", jobID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update job"})
		return
	}

	// Re-generate embedding if title changed
	if req.Title != "" {
		go func() {
			if err := generateJobEmbedding(job.ID, job.Title); err != nil {
				log.Printf("Failed to regenerate embedding for job %s: %v", job.ID, err)
			} else {
				log.Printf("✅ Regenerated embedding for job: %s", job.Title)
			}
		}()
	}

	c.JSON(http.StatusOK, job)
}

// DeleteJob deletes a job posting
func DeleteJob(c *gin.Context) {
	jobID := c.Param("id")
	recruiterID := c.GetString("user_id")

	// Check ownership
	var ownerID string
	err := config.DB.QueryRow("SELECT recruiter_id FROM jobs WHERE id = $1", jobID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if ownerID != recruiterID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own jobs"})
		return
	}

	result, err := config.DB.Exec("DELETE FROM jobs WHERE id = $1", jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete job"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Job deleted successfully"})
}

// GetJobByID retrieves job details with company info (public endpoint)
func GetJobByID(c *gin.Context) {
	jobID := c.Param("id")

	var job models.Job
	// Explicitly defining columns to avoid * and ensure order matches Scan
	query := `
		SELECT j.id, j.title, j.description, j.salary, j.location, j.job_type, j.work_location,
		       j.openings, j.required_skills, j.company_id, j.recruiter_id, j.status, j.created_at, j.updated_at,
		       c.name as company_name
		FROM jobs j
		JOIN companies c ON j.company_id = c.id
		WHERE j.id = $1`

	err := config.DB.QueryRow(query, jobID).
		Scan(&job.ID, &job.Title, &job.Description, &job.Salary, &job.Location, &job.JobType,
			&job.WorkLocation, &job.Openings, pq.Array(&job.RequiredSkills), &job.CompanyID,
			&job.RecruiterID, &job.Status, &job.CreatedAt, &job.UpdatedAt, &job.CompanyName)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	} else if err != nil {
		log.Printf("GetJobByID error for job %s: %v", jobID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, job)
}

// SearchJobs searches jobs with filters (public endpoint)
func SearchJobs(c *gin.Context) {
	// Query parameters
	keyword := c.Query("keyword")
	location := c.Query("location")
	jobType := c.Query("job_type")
	workLocation := c.Query("work_location")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	// Build query
	query := `
		SELECT j.id, j.title, j.description, j.salary, j.location, j.job_type, j.work_location,
		       j.openings, j.required_skills, j.company_id, j.recruiter_id, j.status, j.created_at, j.updated_at,
		       c.name as company_name
		FROM jobs j
		JOIN companies c ON j.company_id = c.id
		WHERE j.status = 'active'
	`
	args := []interface{}{}
	argIndex := 1

	if keyword != "" {
		query += ` AND (j.title ILIKE $` + strconv.Itoa(argIndex) + ` OR j.description ILIKE $` + strconv.Itoa(argIndex) + `)`
		args = append(args, "%"+keyword+"%")
		argIndex++
	}
	if location != "" {
		query += ` AND j.location ILIKE $` + strconv.Itoa(argIndex)
		args = append(args, "%"+location+"%")
		argIndex++
	}
	if jobType != "" {
		query += ` AND j.job_type = $` + strconv.Itoa(argIndex)
		args = append(args, jobType)
		argIndex++
	}
	if workLocation != "" {
		query += ` AND j.work_location = $` + strconv.Itoa(argIndex)
		args = append(args, workLocation)
		argIndex++
	}
	companyID := c.Query("company_id")
	if companyID != "" {
		query += ` AND j.company_id = $` + strconv.Itoa(argIndex)
		args = append(args, companyID)
		argIndex++
	}
	recruiterID := c.Query("recruiter_id")
	if recruiterID != "" {
		query += ` AND j.recruiter_id = $` + strconv.Itoa(argIndex)
		args = append(args, recruiterID)
		argIndex++
	}

	query += ` ORDER BY j.created_at DESC LIMIT $` + strconv.Itoa(argIndex) + ` OFFSET $` + strconv.Itoa(argIndex+1)
	args = append(args, limit, offset)

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	jobs := []models.Job{}
	for rows.Next() {
		var job models.Job
		err := rows.Scan(&job.ID, &job.Title, &job.Description, &job.Salary, &job.Location, &job.JobType,
			&job.WorkLocation, &job.Openings, pq.Array(&job.RequiredSkills), &job.CompanyID,
			&job.RecruiterID, &job.Status, &job.CreatedAt, &job.UpdatedAt, &job.CompanyName)
		if err != nil {
			continue
		}
		jobs = append(jobs, job)
	}

	c.JSON(http.StatusOK, gin.H{
		"jobs":  jobs,
		"page":  page,
		"limit": limit,
		"count": len(jobs),
	})
}

// GetJobsByCompany retrieves all jobs for a company (public endpoint)
func GetJobsByCompany(c *gin.Context) {
	companyID := c.Param("companyId")

	query := `
		SELECT j.id, j.title, j.description, j.salary, j.location, j.job_type, j.work_location,
		       j.openings, j.required_skills, j.company_id, j.recruiter_id, j.status, j.created_at, j.updated_at,
		       c.name as company_name
		FROM jobs j
		JOIN companies c ON j.company_id = c.id
		WHERE j.company_id = $1 AND j.status = 'active'
		ORDER BY j.created_at DESC
	`

	rows, err := config.DB.Query(query, companyID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	jobs := []models.Job{}
	for rows.Next() {
		var job models.Job
		err := rows.Scan(&job.ID, &job.Title, &job.Description, &job.Salary, &job.Location, &job.JobType,
			&job.WorkLocation, &job.Openings, pq.Array(&job.RequiredSkills), &job.CompanyID,
			&job.RecruiterID, &job.Status, &job.CreatedAt, &job.UpdatedAt, &job.CompanyName)
		if err != nil {
			continue
		}
		jobs = append(jobs, job)
	}

	c.JSON(http.StatusOK, jobs)
}

// GetJobApplications retrieves all applications for a job (recruiters only)
func GetJobApplications(c *gin.Context) {
	jobID := c.Param("id")
	recruiterID := c.GetString("user_id")

	// Check ownership
	var ownerID string
	err := config.DB.QueryRow("SELECT recruiter_id FROM jobs WHERE id = $1", jobID).Scan(&ownerID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if ownerID != recruiterID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only view applications for your own jobs"})
		return
	}

	query := `
		SELECT a.id, a.job_id, a.applicant_id, a.email, a.resume_url, a.cover_letter, a.status, a.subscribed, a.applied_at, a.updated_at,
		       u.name as applicant_name
		FROM applications a
		LEFT JOIN users u ON a.applicant_id = u.id
		WHERE a.job_id = $1
		ORDER BY a.applied_at DESC
	`

	rows, err := config.DB.Query(query, jobID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	applications := []models.Application{}
	for rows.Next() {
		var app models.Application
		err := rows.Scan(&app.ID, &app.JobID, &app.ApplicantID, &app.Email, &app.ResumeURL, &app.CoverLetter,
			&app.Status, &app.Subscribed, &app.AppliedAt, &app.UpdatedAt, &app.ApplicantName)
		if err != nil {
			continue
		}
		applications = append(applications, app)
	}

	c.JSON(http.StatusOK, applications)
}
