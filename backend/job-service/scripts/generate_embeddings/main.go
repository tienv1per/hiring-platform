package main

import (
	"fmt"
	"log"
	"strings"

	"github.com/job-portal/job-service/config"
	"github.com/job-portal/job-service/embedding"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database connection
	config.InitDB()
	defer config.CloseDB()

	// Initialize embedding service
	embeddingService := embedding.NewEmbeddingService("http://localhost:8006")
	if err := embeddingService.HealthCheck(); err != nil {
		log.Fatalf("❌ Embedding server not available: %v", err)
	}
	log.Println("✅ Embedding service connected")

	// Fetch all jobs without embeddings
	rows, err := config.DB.Query(`
		SELECT id, title 
		FROM jobs 
		WHERE title_embedding IS NULL
		ORDER BY created_at DESC
	`)
	if err != nil {
		log.Fatalf("Failed to query jobs: %v", err)
	}
	defer rows.Close()

	type Job struct {
		ID    string
		Title string
	}

	var jobs []Job
	for rows.Next() {
		var job Job
		if err := rows.Scan(&job.ID, &job.Title); err != nil {
			log.Printf("Scan error: %v", err)
			continue
		}
		jobs = append(jobs, job)
	}

	if len(jobs) == 0 {
		log.Println("✅ All jobs already have embeddings!")
		return
	}

	log.Printf("📊 Found %d jobs without embeddings\n", len(jobs))
	log.Println("🔧 Generating embeddings...")

	successCount := 0
	failCount := 0

	for i, job := range jobs {
		// Generate embedding
		embedding, err := embeddingService.GetEmbedding(job.Title)
		if err != nil {
			log.Printf("❌ [%d/%d] Failed to generate embedding for '%s': %v",
				i+1, len(jobs), job.Title, err)
			failCount++
			continue
		}

		// Format embedding as string "[v1,v2,...]" for pgvector
		vectorStr := "[" + strings.Trim(strings.Join(strings.Fields(fmt.Sprint(embedding)), ","), "[]") + "]"

		// Update database
		_, err = config.DB.Exec(
			"UPDATE jobs SET title_embedding = $1::vector WHERE id = $2",
			vectorStr,
			job.ID,
		)
		if err != nil {
			log.Printf("❌ [%d/%d] Failed to save embedding for '%s': %v",
				i+1, len(jobs), job.Title, err)
			failCount++
			continue
		}

		successCount++
		log.Printf("✅ [%d/%d] %s", i+1, len(jobs), job.Title)
	}

	fmt.Println("\n" + strings.Repeat("=", 50))
	log.Printf("🎉 Batch embedding complete!")
	log.Printf("   Success: %d", successCount)
	log.Printf("   Failed:  %d", failCount)
	log.Printf("   Total:   %d", len(jobs))
	fmt.Println(strings.Repeat("=", 50))
}
