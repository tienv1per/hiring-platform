package models

import "time"

type User struct {
	ID            string    `json:"id" db:"id"`
	Name          string    `json:"name" db:"name"`
	Email         string    `json:"email" db:"email"`
	Phone         string    `json:"phone,omitempty" db:"phone"`
	Role          string    `json:"role" db:"role"`
	Bio           string    `json:"bio,omitempty" db:"bio"`
	ResumeURL     string    `json:"resume_url,omitempty" db:"resume_url"`
	ProfilePicURL string    `json:"profile_pic_url,omitempty" db:"profile_pic_url"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
}

type UpdateProfileRequest struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Bio   string `json:"bio"`
}

type Skill struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Color     string    `json:"color" db:"color"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type UserSkill struct {
	UserID     string    `json:"user_id" db:"user_id"`
	SkillID    string    `json:"skill_id" db:"skill_id"`
	SkillName  string    `json:"skill_name" db:"name"`
	SkillColor string    `json:"skill_color" db:"color"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type AddSkillsRequest struct {
	Skills []string `json:"skills" binding:"required,min=1"`
}
