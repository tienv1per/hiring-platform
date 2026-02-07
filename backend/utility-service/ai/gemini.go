package ai

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

var client *genai.Client

// InitGemini initializes the Google Gemini AI client
func InitGemini() {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Println("⚠️  GEMINI_API_KEY not set, AI features will be unavailable")
		return
	}

	var err error
	ctx := context.Background()
	client, err = genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Printf("Failed to create Gemini client: %v", err)
		return
	}

	log.Println("✅ Google Gemini AI client initialized")
}

// GenerateCareerGuidance generates career advice based on user profile
func GenerateCareerGuidance(skills []string, experience string, goals string) (string, error) {
	if client == nil {
		return "", fmt.Errorf("Gemini client not initialized")
	}

	ctx := context.Background()
	model := client.GenerativeModel("gemini-pro")

	prompt := fmt.Sprintf(`You are a career counselor. Based on the following information, provide personalized career guidance:

Skills: %v
Experience: %s
Career Goals: %s

Please provide:
1. Suitable career paths
2. Skills to develop
3. Learning resources
4. Job market insights
5. Next steps

Keep the response concise and actionable.`, skills, experience, goals)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return "", err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no response generated")
	}

	return fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0]), nil
}

// AnalyzeResume analyzes a resume and provides ATS score and feedback
func AnalyzeResume(resumeText string, jobDescription string) (map[string]interface{}, error) {
	if client == nil {
		return nil, fmt.Errorf("Gemini client not initialized")
	}

	ctx := context.Background()
	model := client.GenerativeModel("gemini-pro")

	prompt := fmt.Sprintf(`You are an ATS (Applicant Tracking System) resume analyzer. Analyze the following resume against the job description:

RESUME:
%s

JOB DESCRIPTION:
%s

Provide a JSON response with:
{
  "ats_score": <number 0-100>,
  "strengths": [<list of strengths>],
  "weaknesses": [<list of areas to improve>],
  "missing_keywords": [<important keywords missing from resume>],
  "suggestions": [<specific improvement suggestions>]
}

Be objective and constructive.`, resumeText, jobDescription)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("no response generated")
	}

	// Return response as map (parsing would require more complex logic)
	result := map[string]interface{}{
		"analysis": fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0]),
	}

	return result, nil
}
