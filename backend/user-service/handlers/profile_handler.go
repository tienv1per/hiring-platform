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
	var bio, resumeURL, profilePicURL sql.NullString
	query := `
		SELECT id, name, email, phone, role, bio, resume_url, profile_pic_url, created_at, updated_at
		FROM users WHERE id = $1
	`
	err := config.DB.QueryRow(query, userID).Scan(
		&user.ID, &user.Name, &user.Email, &user.Phone, &user.Role,
		&bio, &resumeURL, &profilePicURL, &user.CreatedAt, &user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
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

	// Fetch user skills with colors
	skillsQuery := `
		SELECT us.user_id, us.skill_id, s.name, s.color, us.created_at
		FROM user_skills us
		JOIN skills s ON us.skill_id = s.id
		WHERE us.user_id = $1
		ORDER BY s.name
	`

	rows, err := config.DB.Query(skillsQuery, userID)
	if err != nil {
		// Skills are optional, so we don't fail if query errors
		c.JSON(http.StatusOK, user)
		return
	}
	defer rows.Close()

	var skills []models.UserSkill
	for rows.Next() {
		var skill models.UserSkill
		if err := rows.Scan(&skill.UserID, &skill.SkillID, &skill.SkillName, &skill.SkillColor, &skill.CreatedAt); err != nil {
			continue
		}
		skills = append(skills, skill)
	}

	// Create response with skills
	response := gin.H{
		"id":                  user.ID,
		"name":                user.Name,
		"email":               user.Email,
		"phone":               user.Phone,
		"role":                user.Role,
		"bio":                 user.Bio,
		"resume_url":          user.ResumeURL,
		"profile_picture_url": user.ProfilePicURL,
		"created_at":          user.CreatedAt,
		"updated_at":          user.UpdatedAt,
		"skills":              skills,
	}

	c.JSON(http.StatusOK, response)
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
	var bio, resumeURL, profilePicURL sql.NullString
	err := config.DB.QueryRow(query, req.Name, req.Phone, req.Bio, userID).Scan(
		&user.ID, &user.Name, &user.Email, &user.Phone, &user.Role,
		&bio, &resumeURL, &profilePicURL, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
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

	c.JSON(http.StatusOK, user)
}
