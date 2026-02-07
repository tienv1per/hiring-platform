package handlers

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/auth-service/config"
	"github.com/job-portal/auth-service/models"
	"github.com/job-portal/auth-service/utils"
)

// Register handles user registration
func Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	var existingID string
	err := config.DB.QueryRow("SELECT id FROM users WHERE email = $1", req.Email).Scan(&existingID)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	} else if err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Insert user
	var user models.User
	query := `
		INSERT INTO users (name, email, password_hash, phone, role)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, email, phone, role, created_at, updated_at
	`
	err = config.DB.QueryRow(query, req.Name, req.Email, hashedPassword, req.Phone, req.Role).
		Scan(&user.ID, &user.Name, &user.Email, &user.Phone, &user.Role, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, models.AuthResponse{
		Token: token,
		User:  user,
	})
}

// Login handles user authentication
func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user from database
	var user models.User
	var bio, resumeURL, profilePicURL sql.NullString
	query := `
		SELECT id, name, email, password_hash, phone, role, bio, resume_url, profile_pic_url, created_at, updated_at
		FROM users WHERE email = $1
	`
	err := config.DB.QueryRow(query, req.Email).
		Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.Phone, &user.Role,
			&bio, &resumeURL, &profilePicURL, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Handle nullable fields
	if bio.Valid {
		user.Bio = bio.String
	}
	if resumeURL.Valid {
		user.ResumeURL = resumeURL.String
	}
	if profilePicURL.Valid {
		user.ProfilePicURL = profilePicURL.String
	}

	// Check password
	if err := utils.CheckPassword(user.PasswordHash, req.Password); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Generate JWT token
	token, err := utils.GenerateJWT(user.ID, user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, models.AuthResponse{
		Token: token,
		User:  user,
	})
}

// ForgotPassword generates a reset token and sends email via Kafka
func ForgotPassword(c *gin.Context) {
	var req models.ForgotPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user exists
	var userID, userName string
	err := config.DB.QueryRow("SELECT id, name FROM users WHERE email = $1", req.Email).Scan(&userID, &userName)
	if err == sql.ErrNoRows {
		// Don't reveal if user exists or not
		c.JSON(http.StatusOK, gin.H{"message": "If the email exists, a reset link will be sent"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Generate reset token
	resetToken := generateResetToken()

	// Store token in Redis with 15-minute expiration
	key := fmt.Sprintf("reset_token:%s", resetToken)
	err = config.RedisClient.Set(config.Ctx, key, userID, 15*time.Minute).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store reset token"})
		return
	}

	// TODO: Send email via Kafka
	// For now, return the token (in production, send via email)
	// kafka.ProduceEmailEvent(userEmail, "Password Reset", resetToken)

	c.JSON(http.StatusOK, gin.H{
		"message": "If the email exists, a reset link will be sent",
		"token":   resetToken, // Remove in production
	})
}

// ResetPassword resets password using the token
func ResetPassword(c *gin.Context) {
	var req models.ResetPasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user ID from Redis
	key := fmt.Sprintf("reset_token:%s", req.Token)
	userID, err := config.RedisClient.Get(config.Ctx, key).Result()
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
		return
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Update password
	_, err = config.DB.Exec("UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
		hashedPassword, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	// Delete token from Redis
	config.RedisClient.Del(config.Ctx, key)

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully"})
}

// generateResetToken generates a secure random token
func generateResetToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}
