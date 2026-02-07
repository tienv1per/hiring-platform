# Quick Fix for Login 500 Error

## Problem
The auth service returns **500 Internal Server Error** because it tries to scan NULL values from database fields `bio`, `resume_url`, and `profile_pic_url` into Go string types, which fails.

## Solution
Updated the login handler in `auth-service/handlers/auth_handler.go` to use `sql.NullString` for nullable fields.

## What Changed

**Before (causing 500 error):**
```go
err := config.DB.QueryRow(query, req.Email).
    Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.Phone, &user.Role,
        &user.Bio, &user.ResumeURL, &user.ProfilePicURL, &user.CreatedAt, &user.UpdatedAt)
```

**After (fixed):**
```go
var bio, resumeURL, profilePicURL sql.NullString
err := config.DB.QueryRow(query, req.Email).
    Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.Phone, &user.Role,
        &bio, &resumeURL, &profilePicURL, &user.CreatedAt, &user.UpdatedAt)

// Handle nullable fields
if bio.Valid {
    user.Bio = bio.String
}
if resumeURL.Valid {
    user.ResumeURL = &resumeURL.String
}
if profilePicURL.Valid {
    user.ProfilePicURL = &profilePicURL.String
}
```

## How to Test

1. **Re-run the auth service** (it will auto-reload with the fix):
   ```bash
   cd backend/auth-service
   go run main.go
   ```

2. **Register a user** (if you haven't):
   ```bash
   curl -X POST http://localhost:8001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "test123",
       "role": "jobseeker"
     }'
   ```

3. **Test login**:
   ```bash
   curl -X POST http://localhost:8001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "test123"
     }'
   ```

   **Expected:** You should see a 200 OK with a token!

4. **Try frontend login**:
   - Go to http://localhost:3000/login
   - Email: `test@example.com`
   - Password: `test123`
   - Should work now! ✅

## Why This Happened

When a user is first created via registration, the optional fields (`bio`, `resume_url`, `profile_pic_url`) are NULL in the database. When the login handler tries to scan these NULL values into Go string types, it fails because Go strings can't be NULL. The solution is to use `sql.NullString` which has a `Valid` field to check if the value is NULL or not.

---

**Try logging in again and it should work!** 🎉
