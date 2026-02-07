# Cloudinary Setup Guide

Cloudinary is used for storing and serving user-uploaded files (resumes and profile pictures) via CDN.

---

## Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com
2. Click **Sign Up Free**
3. Choose the **Free Plan** (includes 25 GB storage, 25 GB bandwidth)
4. Complete registration with email

---

## Step 2: Get Your Credentials

After signing in:

1. Go to your **Dashboard** (https://console.cloudinary.com)
2. You'll see your credentials in the **Account Details** section:
   - **Cloud Name**: e.g., `dxyz123abc`
   - **API Key**: e.g., `123456789012345`
   - **API Secret**: e.g., `abcdefGHIJKLMNOPqrstuvwxyz123`

![Cloudinary Dashboard](https://res.cloudinary.com/demo/image/upload/v1/cloudinary_console.png)

---

## Step 3: Configure Environment Variables

Add your Cloudinary credentials to the `.env` file in the project root:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

**Example:**
```bash
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefGHIJKLMNOPqrstuvwxyz123
```

---

## Step 4: Verify Configuration

The upload handlers in the User Service will automatically read these credentials from the environment variables.

**Test the configuration:**

1. Start the user service:
   ```bash
   cd backend/user-service
   go run main.go
   ```

2. Check logs for any Cloudinary connection errors

3. Test upload endpoint:
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "resume=@/path/to/test-resume.pdf" \
     http://localhost:8002/api/users/upload-resume
   ```

---

## How It Works

### Upload Flow

```
User → Upload API → Cloudinary SDK → Cloudinary Cloud
                                           ↓
                                      CDN (Secure URL)
                                           ↓
Database ← Store URL ← Return to API ← Uploaded
```

### Folder Structure in Cloudinary

Files are automatically organized:
- **Resumes**: `/resumes/`
- **Profile Pictures**: `/profile-pics/`

### File Management

Upload parameters configured in code:
- `ResourceType: "auto"` - Auto-detect file type
- `UseFilename: true` - Keep original filename
- `UniqueFilename: true` - Add unique suffix to prevent conflicts

---

## Important Notes

### Security
✅ **API Secret** is sensitive - never commit to Git  
✅ Already added to `.gitignore`  
✅ Use different credentials for dev/staging/production  

### Free Tier Limits
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month

If you exceed limits, consider upgrading to a paid plan.

### Supported File Types

**Resumes:**
- PDF (`.pdf`)
- Microsoft Word (`.doc`, `.docx`)
- Max size: 5 MB

**Profile Pictures:**
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)
- Max size: 2 MB

---

## Troubleshooting

### Error: "Cloudinary credentials not configured"

**Solution:** Check that all three environment variables are set in `.env`:
```bash
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Error: "Upload timeout"

**Solution:** Check internet connection. Upload timeout is set to 30 seconds in code.

### Error: "Invalid signature"

**Solution:** Your API Secret might be incorrect. Double-check from Cloudinary dashboard.

---

## Advanced Configuration (Optional)

### Image Transformations

Cloudinary supports automatic image transformations. To resize profile pictures:

```go
// In cloudinary.go
uploadResult, err := cld.Upload.Upload(ctx, src, uploader.UploadParams{
    Folder:         folder,
    ResourceType:   "auto",
    UseFilename:    boolPtr(true),
    UniqueFilename: boolPtr(true),
    Transformation: "c_fill,w_200,h_200,g_face", // Crop to 200x200, focus on face
})
```

### Custom Upload Presets

1. Go to Cloudinary Dashboard → Settings → Upload
2. Create upload presets with custom transformations
3. Use preset name in upload params

---

## Next Steps

After setup:
1. ✅ Verify credentials in `.env`
2. ✅ Test resume upload
3. ✅ Test profile picture upload
4. ✅ Check files in Cloudinary Media Library

You're all set! 🎉
