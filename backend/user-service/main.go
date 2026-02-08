package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/user-service/config"
	"github.com/job-portal/user-service/handlers"
	"github.com/job-portal/user-service/middleware"
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

	// Set up Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(middleware.CORSMiddleware())

	// Prometheus metrics middleware
	router.Use(middleware.PrometheusMiddleware())

	// Start metrics server on separate port
	middleware.StartMetricsServer("9102")
	log.Println("📊 Metrics server started on port 9102")

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "user-service"})
	})

	// User routes (protected)
	users := router.Group("/api/users")
	users.Use(middleware.AuthMiddleware())
	{
		// Profile endpoints
		users.GET("/:id", handlers.GetProfile)
		users.PUT("/:id", handlers.UpdateProfile)

		// Skills endpoints
		users.POST("/:id/skills", handlers.AddSkills)
		users.DELETE("/:id/skills/:skillId", handlers.RemoveSkill)
		users.GET("/:id/skills", handlers.GetUserSkills)

		// File upload endpoints
		users.POST("/upload-resume", handlers.UploadResume)
		users.POST("/upload-profile-pic", handlers.UploadProfilePic)
	}

	// Public skill search
	router.GET("/api/skills", handlers.SearchSkills)

	// Start server
	port := os.Getenv("USER_SERVICE_PORT")
	if port == "" {
		port = "8002"
	}

	log.Printf("🚀 User Service starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
