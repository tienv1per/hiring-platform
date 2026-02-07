package embedding

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// EmbeddingService handles communication with the embedding server
type EmbeddingService struct {
	baseURL string
	client  *http.Client
}

// EmbedRequest represents the request to embed a single text
type EmbedRequest struct {
	Text string `json:"text"`
}

// EmbedResponse represents the response from embedding a single text
type EmbedResponse struct {
	Embedding  []float32 `json:"embedding"`
	Dimensions int       `json:"dimensions"`
}

// BatchEmbedRequest represents the request to embed multiple texts
type BatchEmbedRequest struct {
	Texts []string `json:"texts"`
}

// BatchEmbedResponse represents the response from batch embedding
type BatchEmbedResponse struct {
	Embeddings [][]float32 `json:"embeddings"`
	Count      int         `json:"count"`
	Dimensions int         `json:"dimensions"`
}

// NewEmbeddingService creates a new embedding service client
func NewEmbeddingService(baseURL string) *EmbeddingService {
	return &EmbeddingService{
		baseURL: baseURL,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// GetEmbedding generates an embedding for a single text
func (s *EmbeddingService) GetEmbedding(text string) ([]float32, error) {
	if text == "" {
		return nil, fmt.Errorf("text cannot be empty")
	}

	reqBody := EmbedRequest{Text: text}
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := s.client.Post(
		s.baseURL+"/embed",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to call embedding server: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("embedding server returned error: %s", string(body))
	}

	var embedResp EmbedResponse
	if err := json.NewDecoder(resp.Body).Decode(&embedResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return embedResp.Embedding, nil
}

// GetBatchEmbeddings generates embeddings for multiple texts
func (s *EmbeddingService) GetBatchEmbeddings(texts []string) ([][]float32, error) {
	if len(texts) == 0 {
		return nil, fmt.Errorf("texts cannot be empty")
	}

	reqBody := BatchEmbedRequest{Texts: texts}
	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	resp, err := s.client.Post(
		s.baseURL+"/embed/batch",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to call embedding server: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("embedding server returned error: %s", string(body))
	}

	var batchResp BatchEmbedResponse
	if err := json.NewDecoder(resp.Body).Decode(&batchResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return batchResp.Embeddings, nil
}

// HealthCheck checks if the embedding server is healthy
func (s *EmbeddingService) HealthCheck() error {
	resp, err := s.client.Get(s.baseURL + "/health")
	if err != nil {
		return fmt.Errorf("health check failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("embedding server unhealthy: status %d", resp.StatusCode)
	}

	return nil
}
