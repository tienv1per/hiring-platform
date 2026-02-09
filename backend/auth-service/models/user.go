package models

import "time"

type User struct {
	ID            string    `json:"id" db:"id"`
	Name          string    `json:"name" db:"name"`
	Email         string    `json:"email" db:"email"`
	PasswordHash  string    `json:"-" db:"password_hash"` // Never send password hash to client
	Phone         string    `json:"phone,omitempty" db:"phone"`
	Role          string    `json:"role" db:"role"` // jobseeker or recruiter
	Bio           string    `json:"bio,omitempty" db:"bio"`
	ResumeURL     string    `json:"resume_url,omitempty" db:"resume_url"`
	ProfilePicURL string    `json:"profile_pic_url,omitempty" db:"profile_pic_url"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
}

// User registration/login requests
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Phone    string `json:"phone"`
	Role     string `json:"role" binding:"required,oneof=jobseeker recruiter admin"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type ResetPasswordRequest struct {
	Token       string `json:"token" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

// Auth responses
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
