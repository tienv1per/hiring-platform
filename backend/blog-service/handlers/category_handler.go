package handlers

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/blog-service/config"
	"github.com/job-portal/blog-service/models"
	"github.com/job-portal/blog-service/utils"
)

// ListCategories returns all categories (public)
func ListCategories(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT id, name, slug, description, created_at, updated_at
		FROM blog_categories
		ORDER BY name ASC
	`)
	if err != nil {
		log.Println("Error querying categories:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}
	defer rows.Close()

	categories := []models.Category{}
	for rows.Next() {
		var cat models.Category
		err := rows.Scan(&cat.ID, &cat.Name, &cat.Slug, &cat.Description, &cat.CreatedAt, &cat.UpdatedAt)
		if err != nil {
			log.Println("Error scanning category:", err)
			continue
		}
		categories = append(categories, cat)
	}

	c.JSON(http.StatusOK, gin.H{"categories": categories})
}

// CreateCategory creates a new blog category (admin only)
func CreateCategory(c *gin.Context) {
	var req models.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	slug := utils.GenerateSlug(req.Name)

	var cat models.Category
	err := config.DB.QueryRow(`
		INSERT INTO blog_categories (name, slug, description)
		VALUES ($1, $2, $3)
		RETURNING id, name, slug, description, created_at, updated_at
	`, req.Name, slug, req.Description).Scan(
		&cat.ID, &cat.Name, &cat.Slug, &cat.Description, &cat.CreatedAt, &cat.UpdatedAt)
	if err != nil {
		log.Println("Error creating category:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category. Name may already exist."})
		return
	}

	c.JSON(http.StatusCreated, cat)
}

// UpdateCategory updates an existing category (admin only)
func UpdateCategory(c *gin.Context) {
	catID := c.Param("id")

	var req models.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check category exists
	var existing models.Category
	err := config.DB.QueryRow(`SELECT id FROM blog_categories WHERE id = $1`, catID).Scan(&existing.ID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	slug := utils.GenerateSlug(req.Name)

	var cat models.Category
	err = config.DB.QueryRow(`
		UPDATE blog_categories
		SET name = COALESCE(NULLIF($1, ''), name),
		    slug = COALESCE(NULLIF($2, ''), slug),
		    description = COALESCE(NULLIF($3, ''), description),
		    updated_at = NOW()
		WHERE id = $4
		RETURNING id, name, slug, description, created_at, updated_at
	`, req.Name, slug, req.Description, catID).Scan(
		&cat.ID, &cat.Name, &cat.Slug, &cat.Description, &cat.CreatedAt, &cat.UpdatedAt)
	if err != nil {
		log.Println("Error updating category:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		return
	}

	c.JSON(http.StatusOK, cat)
}

// DeleteCategory deletes a category (admin only)
func DeleteCategory(c *gin.Context) {
	catID := c.Param("id")

	result, err := config.DB.Exec(`DELETE FROM blog_categories WHERE id = $1`, catID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}
