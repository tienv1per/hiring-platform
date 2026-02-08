package models

import (
	"time"
)

// Company represents a company profile
type Company struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Description string    `json:"description,omitempty" db:"description"`
	Website     string    `json:"website,omitempty" db:"website"`
	LogoURL     string    `json:"logo_url,omitempty" db:"logo_url"`
	RecruiterID string    `json:"recruiter_id" db:"recruiter_id"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type CreateCompanyRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	Website     string `json:"website"`
	LogoURL     string `json:"logo_url"`
}

type UpdateCompanyRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Website     string `json:"website"`
	LogoURL     string `json:"logo_url"`
}

// Job represents a job posting
type Job struct {
	ID             string    `json:"id" db:"id"`
	Title          string    `json:"title" db:"title"`
	Description    string    `json:"description" db:"description"` // Supports Markdown
	Salary         string    `json:"salary,omitempty" db:"salary"`
	Location       string    `json:"location" db:"location"`
	JobType        string    `json:"job_type" db:"job_type"`           // full-time, part-time, contract, internship
	WorkLocation   string    `json:"work_location" db:"work_location"` // remote, onsite, hybrid
	Openings       int       `json:"openings" db:"openings"`
	RequiredSkills []string  `json:"required_skills" db:"required_skills"` // Array of skill names
	CompanyID      string    `json:"company_id" db:"company_id"`
	RecruiterID    string    `json:"recruiter_id" db:"recruiter_id"`
	Status         string    `json:"status" db:"status"`     // active, inactive, closed
	TitleEmbedding []float32 `json:"-" db:"title_embedding"` // 384-dim vector for semantic search
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`

	// Joined fields (not in database)
	CompanyName string  `json:"company_name,omitempty" db:"company_name"`
	Similarity  float32 `json:"similarity,omitempty" db:"similarity"` // For search results
}

type CreateJobRequest struct {
	Title          string   `json:"title" binding:"required"`
	Description    string   `json:"description" binding:"required"` // Markdown format
	Salary         string   `json:"salary"`
	Location       string   `json:"location" binding:"required"`
	JobType        string   `json:"job_type" binding:"required,oneof=full-time part-time contract internship"`
	WorkLocation   string   `json:"work_location" binding:"required,oneof=remote onsite hybrid"`
	Openings       int      `json:"openings" binding:"required,min=1"`
	RequiredSkills []string `json:"required_skills"`
	CompanyID      string   `json:"company_id" binding:"required"`
}

type UpdateJobRequest struct {
	Title          string   `json:"title"`
	Description    string   `json:"description"`
	Salary         string   `json:"salary"`
	Location       string   `json:"location"`
	JobType        string   `json:"job_type" binding:"omitempty,oneof=full-time part-time contract internship"`
	WorkLocation   string   `json:"work_location" binding:"omitempty,oneof=remote onsite hybrid"`
	Openings       int      `json:"openings"`
	RequiredSkills []string `json:"required_skills"`
	Status         string   `json:"status" binding:"omitempty,oneof=active inactive closed"`
}

// Application represents a job application
type Application struct {
	ID          string    `json:"id" db:"id"`
	JobID       string    `json:"job_id" db:"job_id"`
	ApplicantID string    `json:"applicant_id" db:"applicant_id"`
	Email       string    `json:"email" db:"email"`
	ResumeURL   string    `json:"resume_url" db:"resume_url"`
	CoverLetter string    `json:"cover_letter,omitempty" db:"cover_letter"`
	Status      string    `json:"status" db:"status"` // pending, viewed, shortlisted, interviewed, offered, rejected
	Subscribed  bool      `json:"subscribed" db:"subscribed"`
	AppliedAt   time.Time `json:"applied_at" db:"applied_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`

	// Joined fields
	JobTitle      string `json:"job_title,omitempty" db:"job_title"`
	CompanyName   string `json:"company_name,omitempty" db:"company_name"`
	ApplicantName string `json:"applicant_name,omitempty" db:"applicant_name"`
}

type ApplyJobRequest struct {
	JobID       string `json:"job_id" binding:"required"`
	Email       string `json:"email" binding:"required,email"`
	ResumeURL   string `json:"resume_url" binding:"required"`
	CoverLetter string `json:"cover_letter"`
	Subscribed  bool   `json:"subscribed"`
}

type UpdateApplicationStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending viewed shortlisted interviewed offered rejected"`
}
