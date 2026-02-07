package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/job-portal/user-service/config"
	"github.com/job-portal/user-service/models"
)

// AddSkills adds skills to user profile
func AddSkills(c *gin.Context) {
	userID := c.Param("id")

	// Authorization check
	requestUserID := c.GetString("user_id")
	if userID != requestUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only modify your own skills"})
		return
	}

	var req models.AddSkillsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	addedSkills := []models.UserSkill{}

	for _, skillName := range req.Skills {
		// Check if skill exists, create if not
		var skillID string
		err := config.DB.QueryRow("SELECT id FROM skills WHERE name = $1", skillName).Scan(&skillID)

		if err == sql.ErrNoRows {
			// Create new skill
			err = config.DB.QueryRow("INSERT INTO skills (name) VALUES ($1) RETURNING id", skillName).Scan(&skillID)
			if err != nil {
				continue // Skip this skill if creation fails
			}
		} else if err != nil {
			continue
		}

		// Add skill to user (ignore if already exists)
		var userSkill models.UserSkill
		query := `
			INSERT INTO user_skills (user_id, skill_id)
			VALUES ($1, $2)
			ON CONFLICT (user_id, skill_id) DO NOTHING
			RETURNING user_id, skill_id, created_at
		`
		err = config.DB.QueryRow(query, userID, skillID).Scan(
			&userSkill.UserID, &userSkill.SkillID, &userSkill.CreatedAt,
		)

		if err == nil {
			userSkill.SkillName = skillName
			addedSkills = append(addedSkills, userSkill)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Skills added successfully",
		"skills":  addedSkills,
	})
}

// RemoveSkill removes a skill from user profile
func RemoveSkill(c *gin.Context) {
	userID := c.Param("id")
	skillID := c.Param("skillId")

	// Authorization check
	requestUserID := c.GetString("user_id")
	if userID != requestUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only modify your own skills"})
		return
	}

	result, err := config.DB.Exec("DELETE FROM user_skills WHERE user_id = $1 AND skill_id = $2", userID, skillID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove skill"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Skill not found in user profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Skill removed successfully"})
}

// GetUserSkills retrieves all skills for a user
func GetUserSkills(c *gin.Context) {
	userID := c.Param("id")

	query := `
		SELECT us.user_id, us.skill_id, s.name, us.created_at
		FROM user_skills us
		JOIN skills s ON us.skill_id = s.id
		WHERE us.user_id = $1
		ORDER BY s.name
	`

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	skills := []models.UserSkill{}
	for rows.Next() {
		var skill models.UserSkill
		if err := rows.Scan(&skill.UserID, &skill.SkillID, &skill.SkillName, &skill.CreatedAt); err != nil {
			continue
		}
		skills = append(skills, skill)
	}

	c.JSON(http.StatusOK, skills)
}

// SearchSkills searches for skills by name (public endpoint)
func SearchSkills(c *gin.Context) {
	searchTerm := c.Query("q")
	if searchTerm == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query required"})
		return
	}

	query := `
		SELECT id, name, created_at
		FROM skills
		WHERE name ILIKE $1
		ORDER BY name
		LIMIT 20
	`

	rows, err := config.DB.Query(query, "%"+searchTerm+"%")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	skills := []models.Skill{}
	for rows.Next() {
		var skill models.Skill
		if err := rows.Scan(&skill.ID, &skill.Name, &skill.CreatedAt); err != nil {
			continue
		}
		skills = append(skills, skill)
	}

	c.JSON(http.StatusOK, skills)
}
