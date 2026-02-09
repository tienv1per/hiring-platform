package models

import "time"

// Category represents a blog category
type Category struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Slug        string    `json:"slug" db:"slug"`
	Description string    `json:"description,omitempty" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// Blog represents a blog post
type Blog struct {
	ID            string     `json:"id" db:"id"`
	Title         string     `json:"title" db:"title"`
	Slug          string     `json:"slug" db:"slug"`
	Content       string     `json:"content" db:"content"`
	Excerpt       string     `json:"excerpt,omitempty" db:"excerpt"`
	CoverImageURL string     `json:"cover_image_url,omitempty" db:"cover_image_url"`
	AuthorID      string     `json:"author_id" db:"author_id"`
	CategoryID    *string    `json:"category_id,omitempty" db:"category_id"`
	Tags          []string   `json:"tags" db:"tags"`
	Status        string     `json:"status" db:"status"`
	ReadTime      int        `json:"read_time" db:"read_time"`
	ViewsCount    int        `json:"views_count" db:"views_count"`
	PublishedAt   *time.Time `json:"published_at,omitempty" db:"published_at"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at" db:"updated_at"`

	// Joined fields (not in database directly)
	AuthorName   string `json:"author_name,omitempty" db:"author_name"`
	CategoryName string `json:"category_name,omitempty" db:"category_name"`
	CategorySlug string `json:"category_slug,omitempty" db:"category_slug"`
}

// ---- Request types ----

type CreateBlogRequest struct {
	Title         string   `json:"title" binding:"required"`
	Content       string   `json:"content" binding:"required"`
	Excerpt       string   `json:"excerpt"`
	CoverImageURL string   `json:"cover_image_url"`
	CategoryID    string   `json:"category_id"`
	Tags          []string `json:"tags"`
	Status        string   `json:"status" binding:"omitempty,oneof=draft published archived"`
}

type UpdateBlogRequest struct {
	Title         string   `json:"title"`
	Content       string   `json:"content"`
	Excerpt       string   `json:"excerpt"`
	CoverImageURL string   `json:"cover_image_url"`
	CategoryID    string   `json:"category_id"`
	Tags          []string `json:"tags"`
	Status        string   `json:"status" binding:"omitempty,oneof=draft published archived"`
}

type PublishBlogRequest struct {
	Status string `json:"status" binding:"required,oneof=draft published archived"`
}

type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type UpdateCategoryRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// ---- Response types ----

type BlogListResponse struct {
	Blogs      []Blog `json:"blogs"`
	Total      int    `json:"total"`
	Page       int    `json:"page"`
	PageSize   int    `json:"page_size"`
	TotalPages int    `json:"total_pages"`
}
