package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/job-portal/job-service/config"
	"github.com/joho/godotenv"
)

type EmbedResponse struct {
	Embedding  []float64 `json:"embedding"`
	Dimensions int       `json:"dimensions"`
}

func getEmbedding(text string) ([]float64, error) {
	payload := map[string]string{"text": text}
	body, _ := json.Marshal(payload)

	resp, err := http.Post("http://localhost:8006/embed", "application/json", bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	data, _ := io.ReadAll(resp.Body)
	var result EmbedResponse
	json.Unmarshal(data, &result)
	return result.Embedding, nil
}

func cosineSimilarity(a, b []float64) float64 {
	var dot, normA, normB float64
	for i := range a {
		dot += a[i] * b[i]
		normA += a[i] * a[i]
		normB += b[i] * b[i]
	}
	if normA == 0 || normB == 0 {
		return 0
	}
	return dot / (sqrt(normA) * sqrt(normB))
}

func sqrt(x float64) float64 {
	if x <= 0 {
		return 0
	}
	z := x / 2
	for i := 0; i < 10; i++ {
		z = z - (z*z-x)/(2*z)
	}
	return z
}

func main() {
	godotenv.Load("../../.env")
	config.InitDB()
	defer config.CloseDB()

	// Get embedding for search query
	query := "software engineer"
	queryEmbed, err := getEmbedding(query)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("Query: '%s' (embedding dimensions: %d)\n\n", query, len(queryEmbed))

	// Get all jobs with their titles
	rows, err := config.DB.Query("SELECT id, title, status FROM jobs ORDER BY created_at DESC")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	fmt.Println("Job Titles and Similarity Scores:")
	fmt.Println("==================================")

	for rows.Next() {
		var id, title, status string
		rows.Scan(&id, &title, &status)

		// Get embedding for this title
		titleEmbed, err := getEmbedding(title)
		if err != nil {
			fmt.Printf("❌ %s - Error: %v\n", title, err)
			continue
		}

		// Calculate similarity
		similarity := cosineSimilarity(queryEmbed, titleEmbed)

		threshold := 0.6
		wouldMatch := similarity > threshold
		matchStr := "❌"
		if wouldMatch {
			matchStr = "✅"
		}

		fmt.Printf("%s %.2f%% | %s (status: %s)\n", matchStr, similarity*100, title, status)
	}

	fmt.Println("\n==================================")
	fmt.Println("Threshold: 60% (0.6)")
	fmt.Println("Jobs with ✅ would appear in search results")
}
