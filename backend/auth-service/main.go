package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/auth-service/config"
	"github.com/job-portal/auth-service/handlers"
	"github.com/job-portal/auth-service/middleware"
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

	// Initialize Redis connection
	config.InitRedis()
	defer config.CloseRedis()

	// Set up Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(middleware.CORSMiddleware())

	// Prometheus metrics middleware
	router.Use(middleware.PrometheusMiddleware())

	// Start metrics server on separate port
	middleware.StartMetricsServer("9101")
	log.Println("📊 Metrics server started on port 9101")

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "auth-service"})
	})

	// Auth routes
	auth := router.Group("/api/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
		auth.POST("/forgot-password", handlers.ForgotPassword)
		auth.POST("/reset-password", handlers.ResetPassword)
	}

	// Start server
	port := os.Getenv("AUTH_SERVICE_PORT")
	if port == "" {
		port = "8001"
	}

	log.Printf("🚀 Auth Service starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
