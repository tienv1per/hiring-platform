package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/utility-service/ai"
)

type CareerGuideRequest struct {
	Skills     []string `json:"skills" binding:"required"`
	Experience string   `json:"experience" binding:"required"`
	Goals      string   `json:"goals" binding:"required"`
}

type ResumeAnalyzeRequest struct {
	ResumeText     string `json:"resume_text" binding:"required"`
	JobDescription string `json:"job_description" binding:"required"`
}

// CareerGuide provides AI-powered career guidance
func CareerGuide(c *gin.Context) {
	var req CareerGuideRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	guidance, err := ai.GenerateCareerGuidance(req.Skills, req.Experience, req.Goals)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate career guidance: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"guidance": guidance,
	})
}

// ResumeAnalyze analyzes resume and provides ATS score
func ResumeAnalyze(c *gin.Context) {
	var req ResumeAnalyzeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	analysis, err := ai.AnalyzeResume(req.ResumeText, req.JobDescription)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to analyze resume: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, analysis)
}
