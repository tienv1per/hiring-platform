package utils

import (
	"context"
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

// UploadToCloudinary uploads a file to Cloudinary and returns the secure URL
func UploadToCloudinary(file *multipart.FileHeader, folder string) (string, error) {
	// Initialize Cloudinary
	cldName := os.Getenv("CLOUDINARY_CLOUD_NAME")
	cldKey := os.Getenv("CLOUDINARY_API_KEY")
	cldSecret := os.Getenv("CLOUDINARY_API_SECRET")

	if cldName == "" || cldKey == "" || cldSecret == "" {
		return "", fmt.Errorf("Cloudinary credentials not configured")
	}

	cld, err := cloudinary.NewFromParams(cldName, cldKey, cldSecret)
	if err != nil {
		return "", err
	}

	// Open file
	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	// Upload to Cloudinary
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Helper for bool pointers
	boolPtr := func(b bool) *bool { return &b }

	// Determine resource type based on file extension
	// PDFs and documents should use "raw" to preserve the file properly
	ext := strings.ToLower(filepath.Ext(file.Filename))
	resourceType := "auto"
	if ext == ".pdf" || ext == ".doc" || ext == ".docx" || ext == ".txt" {
		resourceType = "raw"
	}

	uploadResult, err := cld.Upload.Upload(ctx, src, uploader.UploadParams{
		Folder:         folder,
		ResourceType:   resourceType,
		UseFilename:    boolPtr(true),
		UniqueFilename: boolPtr(true),
	})

	if err != nil {
		return "", err
	}

	return uploadResult.SecureURL, nil
}
