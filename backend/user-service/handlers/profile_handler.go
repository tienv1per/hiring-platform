package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/user-service/config"
	"github.com/job-portal/user-service/models"
)

// GetProfile retrieves user profile by ID
func GetProfile(c *gin.Context) {
	userID := c.Param("id")

	// Authorization check: users can only view their own profile
	requestUserID := c.GetString("user_id")
	if userID != requestUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only view your own profile"})
		return
	}

	var user models.User
	query := `
		SELECT id, name, email, phone, role, bio, resume_url, profile_pic_url, created_at, updated_at
		FROM users WHERE id = $1
	`
	err := config.DB.QueryRow(query, userID).Scan(
		&user.ID, &user.Name, &user.Email, &user.Phone, &user.Role,
		&user.Bio, &user.ResumeURL, &user.ProfilePicURL, &user.CreatedAt, &user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// UpdateProfile updates user profile information
func UpdateProfile(c *gin.Context) {
	userID := c.Param("id")

	// Authorization check
	requestUserID := c.GetString("user_id")
	if userID != requestUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own profile"})
		return
	}

	var req models.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update profile
	query := `
		UPDATE users 
		SET name = COALESCE(NULLIF($1, ''), name),
		    phone = COALESCE(NULLIF($2, ''), phone),
		    bio = COALESCE(NULLIF($3, ''), bio),
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $4
		RETURNING id, name, email, phone, role, bio, resume_url, profile_pic_url, created_at, updated_at
	`

	var user models.User
	err := config.DB.QueryRow(query, req.Name, req.Phone, req.Bio, userID).Scan(
		&user.ID, &user.Name, &user.Email, &user.Phone, &user.Role,
		&user.Bio, &user.ResumeURL, &user.ProfilePicURL, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, user)
}
