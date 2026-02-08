package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/utility-service/ai"
	"github.com/job-portal/utility-service/handlers"
	"github.com/job-portal/utility-service/kafka"
	"github.com/job-portal/utility-service/middleware"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("../../.env"); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize Gemini AI client
	ai.InitGemini()

	// Initialize Kafka producer
	kafka.InitProducer()
	defer kafka.CloseProducer()

	// Start Kafka consumer in background
	go kafka.StartEmailConsumer()

	// Set up Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(middleware.CORSMiddleware())

	// Prometheus metrics middleware
	router.Use(middleware.PrometheusMiddleware())

	// Start metrics server on separate port
	middleware.StartMetricsServer("9104")
	log.Println("📊 Metrics server started on port 9104")

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "utility-service"})
	})

	// AI endpoints (require authentication)
	aiRoutes := router.Group("/api/ai")
	aiRoutes.Use(middleware.AuthMiddleware())
	{
		aiRoutes.POST("/career-guide", handlers.CareerGuide)
		aiRoutes.POST("/resume-analyze", handlers.ResumeAnalyze)
	}

	// Email endpoints (for testing/manual triggers)
	emailRoutes := router.Group("/api/email")
	{
		emailRoutes.POST("/send", handlers.SendEmail) // For testing
	}

	// Start server
	port := os.Getenv("UTILITY_SERVICE_PORT")
	if port == "" {
		port = "8004"
	}

	log.Printf("🚀 Utility Service starting on port %s", port)
	log.Println("📧 Kafka email consumer running in background")
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
