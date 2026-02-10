package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/job-service/config"
	"github.com/job-portal/job-service/embedding"
	"github.com/job-portal/job-service/models"
)

// Global embedding service instance
var embeddingService *embedding.EmbeddingService

// InitEmbeddingService initializes the embedding service
func InitEmbeddingService() {
	embeddingURL := os.Getenv("EMBEDDING_SERVICE_URL")
	if embeddingURL == "" {
		embeddingURL = "http://localhost:8006"
	}
	embeddingService = embedding.NewEmbeddingService(embeddingURL)

	// Health check
	if err := embeddingService.HealthCheck(); err != nil {
		log.Printf("⚠️  Embedding server not available: %v (semantic search disabled)", err)
	} else {
		log.Println("✅ Embedding service connected")
	}
}

// SemanticSearchJobs performs semantic search on job titles using vector similarity
func SemanticSearchJobs(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	threshold := float32(0.35) // Minimum similarity score (35%) - allows broader semantic matches

	// Generate embedding for search query
	queryEmbedding, err := embeddingService.GetEmbedding(query)
	if err != nil {
		log.Printf("Failed to generate embedding: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate search embedding"})
		return
	}

	// Semantic search using pgvector
	sqlQuery := `
		SELECT 
			j.id, j.title, j.description, j.salary, j.location, 
			j.job_type, j.work_location, j.openings, j.required_skills,
			j.company_id, j.status, j.created_at, j.updated_at,
			c.name as company_name,
			1 - (j.title_embedding <=> $1::vector) AS similarity
		FROM jobs j
		LEFT JOIN companies c ON j.company_id = c.id
		WHERE 
			j.title_embedding IS NOT NULL
			AND j.status = 'active'
			AND 1 - (j.title_embedding <=> $1::vector) > $2
		ORDER BY similarity DESC
		LIMIT 20
	`

	// Format embedding as string "[v1,v2,...]" for pgvector
	vectorStr := "[" + strings.Trim(strings.Join(strings.Fields(fmt.Sprint(queryEmbedding)), ","), "[]") + "]"

	rows, err := config.DB.Query(sqlQuery, vectorStr, threshold)
	if err != nil {
		log.Printf("Semantic search query failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database query failed"})
		return
	}
	defer rows.Close()

	var jobs []models.Job
	for rows.Next() {
		var job models.Job
		var requiredSkills sql.NullString

		err := rows.Scan(
			&job.ID, &job.Title, &job.Description, &job.Salary, &job.Location,
			&job.JobType, &job.WorkLocation, &job.Openings, &requiredSkills,
			&job.CompanyID, &job.Status, &job.CreatedAt, &job.UpdatedAt,
			&job.CompanyName, &job.Similarity,
		)
		if err != nil {
			log.Printf("Row scan error: %v", err)
			continue
		}

		// Parse required_skills array
		if requiredSkills.Valid {
			skillsStr := strings.Trim(requiredSkills.String, "{}")
			if skillsStr != "" {
				job.RequiredSkills = strings.Split(skillsStr, ",")
			}
		}

		jobs = append(jobs, job)
	}

	c.JSON(http.StatusOK, gin.H{
		"jobs":  jobs,
		"count": len(jobs),
		"query": query,
	})
}

// Helper function to generate and save embedding for a job
func generateJobEmbedding(jobID, title string) error {
	if embeddingService == nil {
		return fmt.Errorf("embedding service not initialized")
	}

	// Generate embedding
	embedding, err := embeddingService.GetEmbedding(title)
	if err != nil {
		return fmt.Errorf("failed to generate embedding: %w", err)
	}

	// Format embedding as string "[v1,v2,...]" for pgvector
	vectorStr := "[" + strings.Trim(strings.Join(strings.Fields(fmt.Sprint(embedding)), ","), "[]") + "]"

	// Update job with embedding
	_, err = config.DB.Exec(
		"UPDATE jobs SET title_embedding = $1::vector WHERE id = $2",
		vectorStr,
		jobID,
	)
	if err != nil {
		return fmt.Errorf("failed to save embedding: %w", err)
	}

	return nil
}
