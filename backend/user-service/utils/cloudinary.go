package utils

import (
	"context"
	"fmt"
	"log"
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

	// Determine resource type based on folder OR file extension
	// "resumes" folder should ALWAYS use "raw" for PDFs/documents
	// This is more reliable than file extension detection
	ext := strings.ToLower(filepath.Ext(file.Filename))
	resourceType := "auto"

	// Use folder name to determine resource type (more reliable)
	if folder == "resumes" {
		resourceType = "raw"
		log.Printf("Upload: folder='%s', filename='%s', ext='%s' -> forcing resourceType='raw'", folder, file.Filename, ext)
	} else if ext == ".pdf" || ext == ".doc" || ext == ".docx" || ext == ".txt" {
		resourceType = "raw"
		log.Printf("Upload: folder='%s', filename='%s', ext='%s' -> resourceType='raw'", folder, file.Filename, ext)
	} else {
		log.Printf("Upload: folder='%s', filename='%s', ext='%s' -> resourceType='auto'", folder, file.Filename, ext)
	}

	uploadResult, err := cld.Upload.Upload(ctx, src, uploader.UploadParams{
		Folder:         folder,
		ResourceType:   resourceType,
		UseFilename:    boolPtr(true),
		UniqueFilename: boolPtr(true),
	})

	if err != nil {
		log.Printf("Cloudinary upload error: %v", err)
		return "", err
	}

	// Log the upload result for debugging
	log.Printf("Cloudinary upload success - URL: %s, ResourceType: %s, Format: %s, PublicID: %s",
		uploadResult.SecureURL, uploadResult.ResourceType, uploadResult.Format, uploadResult.PublicID)

	return uploadResult.SecureURL, nil
}
