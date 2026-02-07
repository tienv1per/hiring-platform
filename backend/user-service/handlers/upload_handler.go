package handlers

import (
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/user-service/config"
	"github.com/job-portal/user-service/utils"
)

// UploadResume handles resume file upload to Cloudinary
func UploadResume(c *gin.Context) {
	userID := c.GetString("user_id")

	// Get file from form
	file, err := c.FormFile("resume")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Resume file is required"})
		return
	}

	// Validate file type
	ext := filepath.Ext(file.Filename)
	if ext != ".pdf" && ext != ".doc" && ext != ".docx" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only PDF, DOC, and DOCX files are allowed"})
		return
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size must be less than 5MB"})
		return
	}

	// Upload to Cloudinary
	uploadURL, err := utils.UploadToCloudinary(file, "resumes")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file"})
		return
	}

	// Update user resume URL
	_, err = config.DB.Exec(
		"UPDATE users SET resume_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
		uploadURL, userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update resume URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Resume uploaded successfully",
		"resume_url": uploadURL,
	})
}

// UploadProfilePic handles profile picture upload to Cloudinary
func UploadProfilePic(c *gin.Context) {
	userID := c.GetString("user_id")

	// Get file from form
	file, err := c.FormFile("profile_pic")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Profile picture file is required"})
		return
	}

	// Validate file type
	ext := filepath.Ext(file.Filename)
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only JPG, PNG, and WebP images are allowed"})
		return
	}

	// Validate file size (max 2MB)
	if file.Size > 2*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size must be less than 2MB"})
		return
	}

	// Upload to Cloudinary
	uploadURL, err := utils.UploadToCloudinary(file, "profile-pics")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file"})
		return
	}

	// Update user profile pic URL
	_, err = config.DB.Exec(
		"UPDATE users SET profile_pic_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
		uploadURL, userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile picture URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":         "Profile picture uploaded successfully",
		"profile_pic_url": uploadURL,
	})
}
