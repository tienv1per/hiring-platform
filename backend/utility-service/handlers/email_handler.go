package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/utility-service/kafka"
)

type SendEmailRequest struct {
	To      string `json:"to" binding:"required,email"`
	Subject string `json:"subject" binding:"required"`
	Body    string `json:"body" binding:"required"`
	Type    string `json:"type"`
}

// SendEmail sends an email via Kafka (for testing)
func SendEmail(c *gin.Context) {
	var req SendEmailRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Type == "" {
		req.Type = "manual"
	}

	event := kafka.EmailEvent{
		To:      req.To,
		Subject: req.Subject,
		Body:    req.Body,
		Type:    req.Type,
	}

	if err := kafka.ProduceEmailEvent(event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send email event"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Email event sent to Kafka successfully",
	})
}
