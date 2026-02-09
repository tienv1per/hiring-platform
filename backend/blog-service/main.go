package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/blog-service/config"
	"github.com/job-portal/blog-service/handlers"
	"github.com/job-portal/blog-service/middleware"
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
	middleware.StartMetricsServer("9105")
	log.Println("📊 Metrics server started on port 9105")

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "blog-service"})
	})

	// ========================================
	// Public routes (no auth required)
	// ========================================
	publicBlogs := router.Group("/api/blogs")
	{
		publicBlogs.GET("", handlers.ListPublishedBlogs)                // List published blogs (paginated)
		publicBlogs.GET("/:slug", handlers.GetBlogBySlug)               // Get blog by slug
		publicBlogs.GET("/category/:slug", handlers.GetBlogsByCategory) // Filter by category
	}

	publicCategories := router.Group("/api/categories")
	{
		publicCategories.GET("", handlers.ListCategories) // List all categories
	}

	// ========================================
	// Admin routes (require auth + admin role)
	// ========================================
	admin := router.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware())
	admin.Use(middleware.AdminOnly())
	{
		// Blog management
		adminBlogs := admin.Group("/blogs")
		{
			adminBlogs.GET("", handlers.AdminListBlogs)            // List all blogs (incl. drafts)
			adminBlogs.POST("", handlers.CreateBlog)               // Create blog
			adminBlogs.PUT("/:id", handlers.UpdateBlog)            // Update blog
			adminBlogs.DELETE("/:id", handlers.DeleteBlog)         // Delete blog
			adminBlogs.PATCH("/:id/publish", handlers.PublishBlog) // Toggle publish status
		}

		// Category management
		adminCategories := admin.Group("/categories")
		{
			adminCategories.POST("", handlers.CreateCategory)       // Create category
			adminCategories.PUT("/:id", handlers.UpdateCategory)    // Update category
			adminCategories.DELETE("/:id", handlers.DeleteCategory) // Delete category
		}
	}

	// Start server
	port := os.Getenv("BLOG_SERVICE_PORT")
	if port == "" {
		port = "8005"
	}

	log.Printf("🚀 Blog Service starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
