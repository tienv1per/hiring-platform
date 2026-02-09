package handlers

import (
	"database/sql"
	"log"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/blog-service/config"
	"github.com/job-portal/blog-service/models"
	"github.com/job-portal/blog-service/utils"
	"github.com/lib/pq"
)

// ========================================
// Public Endpoints
// ========================================

// ListPublishedBlogs returns paginated published blogs
func ListPublishedBlogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	// Count total published blogs
	var total int
	err := config.DB.QueryRow(`SELECT COUNT(*) FROM blogs WHERE status = 'published'`).Scan(&total)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count blogs"})
		return
	}

	rows, err := config.DB.Query(`
		SELECT b.id, b.title, b.slug, b.excerpt, b.cover_image_url, b.author_id, b.category_id,
		       b.tags, b.status, b.read_time, b.views_count, b.published_at, b.created_at, b.updated_at,
		       u.name AS author_name,
		       COALESCE(c.name, '') AS category_name,
		       COALESCE(c.slug, '') AS category_slug
		FROM blogs b
		JOIN users u ON b.author_id = u.id
		LEFT JOIN blog_categories c ON b.category_id = c.id
		WHERE b.status = 'published'
		ORDER BY b.published_at DESC
		LIMIT $1 OFFSET $2
	`, pageSize, offset)
	if err != nil {
		log.Println("Error querying blogs:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blogs"})
		return
	}
	defer rows.Close()

	blogs := []models.Blog{}
	for rows.Next() {
		var b models.Blog
		err := rows.Scan(&b.ID, &b.Title, &b.Slug, &b.Excerpt, &b.CoverImageURL, &b.AuthorID, &b.CategoryID,
			pq.Array(&b.Tags), &b.Status, &b.ReadTime, &b.ViewsCount, &b.PublishedAt, &b.CreatedAt, &b.UpdatedAt,
			&b.AuthorName, &b.CategoryName, &b.CategorySlug)
		if err != nil {
			log.Println("Error scanning blog:", err)
			continue
		}
		blogs = append(blogs, b)
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	c.JSON(http.StatusOK, models.BlogListResponse{
		Blogs:      blogs,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

// GetBlogBySlug returns a single published blog by its slug
func GetBlogBySlug(c *gin.Context) {
	slug := c.Param("slug")

	var b models.Blog
	err := config.DB.QueryRow(`
		SELECT b.id, b.title, b.slug, b.content, b.excerpt, b.cover_image_url, b.author_id, b.category_id,
		       b.tags, b.status, b.read_time, b.views_count, b.published_at, b.created_at, b.updated_at,
		       u.name AS author_name,
		       COALESCE(c.name, '') AS category_name,
		       COALESCE(c.slug, '') AS category_slug
		FROM blogs b
		JOIN users u ON b.author_id = u.id
		LEFT JOIN blog_categories c ON b.category_id = c.id
		WHERE b.slug = $1 AND b.status = 'published'
	`, slug).Scan(&b.ID, &b.Title, &b.Slug, &b.Content, &b.Excerpt, &b.CoverImageURL, &b.AuthorID, &b.CategoryID,
		pq.Array(&b.Tags), &b.Status, &b.ReadTime, &b.ViewsCount, &b.PublishedAt, &b.CreatedAt, &b.UpdatedAt,
		&b.AuthorName, &b.CategoryName, &b.CategorySlug)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}
	if err != nil {
		log.Println("Error fetching blog:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blog"})
		return
	}

	// Increment view count asynchronously
	go func() {
		config.DB.Exec(`UPDATE blogs SET views_count = views_count + 1 WHERE id = $1`, b.ID)
	}()

	c.JSON(http.StatusOK, b)
}

// GetBlogsByCategory returns published blogs filtered by category slug
func GetBlogsByCategory(c *gin.Context) {
	categorySlug := c.Param("slug")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 10
	}
	offset := (page - 1) * pageSize

	var total int
	err := config.DB.QueryRow(`
		SELECT COUNT(*) FROM blogs b
		JOIN blog_categories c ON b.category_id = c.id
		WHERE c.slug = $1 AND b.status = 'published'
	`, categorySlug).Scan(&total)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count blogs"})
		return
	}

	rows, err := config.DB.Query(`
		SELECT b.id, b.title, b.slug, b.excerpt, b.cover_image_url, b.author_id, b.category_id,
		       b.tags, b.status, b.read_time, b.views_count, b.published_at, b.created_at, b.updated_at,
		       u.name AS author_name,
		       c.name AS category_name,
		       c.slug AS category_slug
		FROM blogs b
		JOIN users u ON b.author_id = u.id
		JOIN blog_categories c ON b.category_id = c.id
		WHERE c.slug = $1 AND b.status = 'published'
		ORDER BY b.published_at DESC
		LIMIT $2 OFFSET $3
	`, categorySlug, pageSize, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blogs"})
		return
	}
	defer rows.Close()

	blogs := []models.Blog{}
	for rows.Next() {
		var b models.Blog
		err := rows.Scan(&b.ID, &b.Title, &b.Slug, &b.Excerpt, &b.CoverImageURL, &b.AuthorID, &b.CategoryID,
			pq.Array(&b.Tags), &b.Status, &b.ReadTime, &b.ViewsCount, &b.PublishedAt, &b.CreatedAt, &b.UpdatedAt,
			&b.AuthorName, &b.CategoryName, &b.CategorySlug)
		if err != nil {
			log.Println("Error scanning blog:", err)
			continue
		}
		blogs = append(blogs, b)
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	c.JSON(http.StatusOK, models.BlogListResponse{
		Blogs:      blogs,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

// ========================================
// Admin Endpoints
// ========================================

// AdminListBlogs returns all blogs including drafts (admin only)
func AdminListBlogs(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	statusFilter := c.Query("status")
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	// Build query based on optional status filter
	countQuery := `SELECT COUNT(*) FROM blogs`
	listQuery := `
		SELECT b.id, b.title, b.slug, b.excerpt, b.cover_image_url, b.author_id, b.category_id,
		       b.tags, b.status, b.read_time, b.views_count, b.published_at, b.created_at, b.updated_at,
		       u.name AS author_name,
		       COALESCE(c.name, '') AS category_name,
		       COALESCE(c.slug, '') AS category_slug
		FROM blogs b
		JOIN users u ON b.author_id = u.id
		LEFT JOIN blog_categories c ON b.category_id = c.id
	`

	var args []interface{}
	if statusFilter != "" {
		countQuery += ` WHERE status = $1`
		listQuery += ` WHERE b.status = $1`
		args = append(args, statusFilter)
	}

	listQuery += ` ORDER BY b.updated_at DESC LIMIT $` + strconv.Itoa(len(args)+1) + ` OFFSET $` + strconv.Itoa(len(args)+2)

	var total int
	if len(args) > 0 {
		err := config.DB.QueryRow(countQuery, args...).Scan(&total)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count blogs"})
			return
		}
	} else {
		err := config.DB.QueryRow(countQuery).Scan(&total)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count blogs"})
			return
		}
	}

	listArgs := append(args, pageSize, offset)
	rows, err := config.DB.Query(listQuery, listArgs...)
	if err != nil {
		log.Println("Error querying admin blogs:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch blogs"})
		return
	}
	defer rows.Close()

	blogs := []models.Blog{}
	for rows.Next() {
		var b models.Blog
		err := rows.Scan(&b.ID, &b.Title, &b.Slug, &b.Excerpt, &b.CoverImageURL, &b.AuthorID, &b.CategoryID,
			pq.Array(&b.Tags), &b.Status, &b.ReadTime, &b.ViewsCount, &b.PublishedAt, &b.CreatedAt, &b.UpdatedAt,
			&b.AuthorName, &b.CategoryName, &b.CategorySlug)
		if err != nil {
			log.Println("Error scanning blog:", err)
			continue
		}
		blogs = append(blogs, b)
	}

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	c.JSON(http.StatusOK, models.BlogListResponse{
		Blogs:      blogs,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

// CreateBlog creates a new blog post (admin only)
func CreateBlog(c *gin.Context) {
	var req models.CreateBlogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	authorID := c.GetString("user_id")

	// Generate slug from title
	slug := utils.GenerateSlug(req.Title)

	// Ensure slug is unique by appending a suffix if needed
	baseSlug := slug
	counter := 1
	for {
		var existingID string
		err := config.DB.QueryRow(`SELECT id FROM blogs WHERE slug = $1`, slug).Scan(&existingID)
		if err == sql.ErrNoRows {
			break
		}
		slug = baseSlug + "-" + strconv.Itoa(counter)
		counter++
	}

	// Estimate read time
	readTime := utils.EstimateReadTime(req.Content)

	// Default status
	status := req.Status
	if status == "" {
		status = "draft"
	}

	// Set published_at if publishing
	var publishedAt *time.Time
	if status == "published" {
		now := time.Now()
		publishedAt = &now
	}

	// Handle nullable category_id
	var categoryID *string
	if req.CategoryID != "" {
		categoryID = &req.CategoryID
	}

	// Handle nil tags
	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}

	var blog models.Blog
	err := config.DB.QueryRow(`
		INSERT INTO blogs (title, slug, content, excerpt, cover_image_url, author_id, category_id, tags, status, read_time, published_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, title, slug, content, excerpt, cover_image_url, author_id, category_id, tags, status, read_time, views_count, published_at, created_at, updated_at
	`, req.Title, slug, req.Content, req.Excerpt, req.CoverImageURL, authorID, categoryID,
		pq.Array(tags), status, readTime, publishedAt).Scan(
		&blog.ID, &blog.Title, &blog.Slug, &blog.Content, &blog.Excerpt, &blog.CoverImageURL,
		&blog.AuthorID, &blog.CategoryID, pq.Array(&blog.Tags), &blog.Status, &blog.ReadTime,
		&blog.ViewsCount, &blog.PublishedAt, &blog.CreatedAt, &blog.UpdatedAt)
	if err != nil {
		log.Println("Error creating blog:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create blog"})
		return
	}

	c.JSON(http.StatusCreated, blog)
}

// UpdateBlog updates an existing blog (admin only)
func UpdateBlog(c *gin.Context) {
	blogID := c.Param("id")

	var req models.UpdateBlogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check blog exists
	var existingStatus string
	err := config.DB.QueryRow(`SELECT status FROM blogs WHERE id = $1`, blogID).Scan(&existingStatus)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Build dynamic update
	setParts := []string{}
	args := []interface{}{}
	argIndex := 1

	if req.Title != "" {
		setParts = append(setParts, "title = $"+strconv.Itoa(argIndex))
		args = append(args, req.Title)
		argIndex++

		// Regenerate slug
		slug := utils.GenerateSlug(req.Title)
		baseSlug := slug
		counter := 1
		for {
			var existingID string
			err := config.DB.QueryRow(`SELECT id FROM blogs WHERE slug = $1 AND id != $2`, slug, blogID).Scan(&existingID)
			if err == sql.ErrNoRows {
				break
			}
			slug = baseSlug + "-" + strconv.Itoa(counter)
			counter++
		}
		setParts = append(setParts, "slug = $"+strconv.Itoa(argIndex))
		args = append(args, slug)
		argIndex++
	}

	if req.Content != "" {
		setParts = append(setParts, "content = $"+strconv.Itoa(argIndex))
		args = append(args, req.Content)
		argIndex++

		readTime := utils.EstimateReadTime(req.Content)
		setParts = append(setParts, "read_time = $"+strconv.Itoa(argIndex))
		args = append(args, readTime)
		argIndex++
	}

	if req.Excerpt != "" {
		setParts = append(setParts, "excerpt = $"+strconv.Itoa(argIndex))
		args = append(args, req.Excerpt)
		argIndex++
	}

	if req.CoverImageURL != "" {
		setParts = append(setParts, "cover_image_url = $"+strconv.Itoa(argIndex))
		args = append(args, req.CoverImageURL)
		argIndex++
	}

	if req.CategoryID != "" {
		setParts = append(setParts, "category_id = $"+strconv.Itoa(argIndex))
		args = append(args, req.CategoryID)
		argIndex++
	}

	if req.Tags != nil {
		setParts = append(setParts, "tags = $"+strconv.Itoa(argIndex))
		args = append(args, pq.Array(req.Tags))
		argIndex++
	}

	if req.Status != "" {
		setParts = append(setParts, "status = $"+strconv.Itoa(argIndex))
		args = append(args, req.Status)
		argIndex++

		// Set published_at when first publishing
		if req.Status == "published" && existingStatus != "published" {
			setParts = append(setParts, "published_at = $"+strconv.Itoa(argIndex))
			args = append(args, time.Now())
			argIndex++
		}
	}

	if len(setParts) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	setParts = append(setParts, "updated_at = NOW()")

	query := `UPDATE blogs SET ` + strings.Join(setParts, ", ") + ` WHERE id = $` + strconv.Itoa(argIndex)
	args = append(args, blogID)

	_, err = config.DB.Exec(query, args...)
	if err != nil {
		log.Println("Error updating blog:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update blog"})
		return
	}

	// Return updated blog
	var blog models.Blog
	err = config.DB.QueryRow(`
		SELECT id, title, slug, content, excerpt, cover_image_url, author_id, category_id,
		       tags, status, read_time, views_count, published_at, created_at, updated_at
		FROM blogs WHERE id = $1
	`, blogID).Scan(&blog.ID, &blog.Title, &blog.Slug, &blog.Content, &blog.Excerpt, &blog.CoverImageURL,
		&blog.AuthorID, &blog.CategoryID, pq.Array(&blog.Tags), &blog.Status, &blog.ReadTime,
		&blog.ViewsCount, &blog.PublishedAt, &blog.CreatedAt, &blog.UpdatedAt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated blog"})
		return
	}

	c.JSON(http.StatusOK, blog)
}

// DeleteBlog deletes a blog post (admin only)
func DeleteBlog(c *gin.Context) {
	blogID := c.Param("id")

	result, err := config.DB.Exec(`DELETE FROM blogs WHERE id = $1`, blogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete blog"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Blog deleted successfully"})
}

// PublishBlog toggles the publish status of a blog (admin only)
func PublishBlog(c *gin.Context) {
	blogID := c.Param("id")

	var req models.PublishBlogRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var publishedAt *time.Time
	if req.Status == "published" {
		now := time.Now()
		publishedAt = &now
	}

	result, err := config.DB.Exec(`
		UPDATE blogs SET status = $1, published_at = COALESCE($2, published_at), updated_at = NOW()
		WHERE id = $3
	`, req.Status, publishedAt, blogID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update blog status"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Blog not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Blog status updated to " + req.Status})
}
