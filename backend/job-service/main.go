package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/job-service/config"
	"github.com/job-portal/job-service/handlers"
	"github.com/job-portal/job-service/middleware"
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
	handlers.InitEmbeddingService()

	// Set up Gin router
	router := gin.Default()

	// CORS middleware
	router.Use(middleware.CORSMiddleware())

	// Prometheus metrics middleware
	router.Use(middleware.PrometheusMiddleware())

	// Start metrics server on separate port
	middleware.StartMetricsServer("9103")
	log.Println("📊 Metrics server started on port 9103")

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "job-service"})
	})

	// Public job routes (no auth required)
	publicJobs := router.Group("/api/jobs")
	{
		publicJobs.GET("", handlers.SearchJobs)                  // Keyword search
		publicJobs.GET("/semantic", handlers.SemanticSearchJobs) // Semantic search
		publicJobs.GET("/:id", handlers.GetJobByID)              // Get job details
		publicJobs.GET("/company/:companyId", handlers.GetJobsByCompany)
	}

	// Public company routes
	publicCompanies := router.Group("/api/companies")
	{
		publicCompanies.GET("/:id", handlers.GetCompany)
		publicCompanies.GET("/all", handlers.GetAllCompanies)
	}

	// Protected routes (require authentication)
	auth := router.Group("/api")
	auth.Use(middleware.AuthMiddleware())
	{
		// Company management (recruiters only)
		companies := auth.Group("/companies")
		{
			companies.GET("", handlers.GetCompanies) // List recruiter's companies
			companies.POST("", middleware.RecruiterOnly(), handlers.CreateCompany)
			companies.PUT("/:id", middleware.RecruiterOnly(), handlers.UpdateCompany)
			companies.DELETE("/:id", middleware.RecruiterOnly(), handlers.DeleteCompany)
		}

		// Job management (recruiters only for create/update/delete)
		jobs := auth.Group("/jobs")
		{
			jobs.POST("", middleware.RecruiterOnly(), handlers.CreateJob)
			jobs.PUT("/:id", middleware.RecruiterOnly(), handlers.UpdateJob)
			jobs.DELETE("/:id", middleware.RecruiterOnly(), handlers.DeleteJob)
			jobs.GET("/:id/applications", middleware.RecruiterOnly(), handlers.GetJobApplications)
		}

		// Application management
		applications := auth.Group("/applications")
		{
			applications.POST("", handlers.ApplyToJob)          // Job seekers apply
			applications.GET("/my", handlers.GetMyApplications) // Get user's applications
			applications.PUT("/:id/status", middleware.RecruiterOnly(), handlers.UpdateApplicationStatus)
		}

		// Admin routes (admin only)
		admin := auth.Group("/admin")
		admin.Use(middleware.AdminOnly())
		{
			admin.GET("/stats", handlers.GetAdminStats)
			admin.GET("/recruiters", handlers.GetAdminRecruiters)
			admin.GET("/companies", handlers.GetAdminCompanies)
			admin.PUT("/companies/:id/assign", handlers.AssignCompanyToRecruiter)
		}
	}

	// Start server
	port := os.Getenv("JOB_SERVICE_PORT")
	if port == "" {
		port = "8003"
	}

	log.Printf("🚀 Job Service starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
