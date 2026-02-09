package utils

import (
	"regexp"
	"strings"
)

var (
	nonAlphanumRegex = regexp.MustCompile(`[^a-z0-9\s-]`)
	whitespaceRegex  = regexp.MustCompile(`[\s]+`)
	dashRegex        = regexp.MustCompile(`-{2,}`)
)

// GenerateSlug creates a URL-friendly slug from a title
func GenerateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = nonAlphanumRegex.ReplaceAllString(slug, "")
	slug = whitespaceRegex.ReplaceAllString(slug, "-")
	slug = dashRegex.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	return slug
}

// EstimateReadTime estimates reading time in minutes based on word count
// Average reading speed is ~200 words per minute
func EstimateReadTime(content string) int {
	words := len(strings.Fields(content))
	minutes := words / 200
	if minutes < 1 {
		return 1
	}
	return minutes
}
