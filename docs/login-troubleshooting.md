# Login 401 Error Troubleshooting Guide

## The Issue

You're getting a **401 Unauthorized** error when trying to login at:
```
http://localhost:3000/api/auth/callback/credentials
```

This happens because NextAuth is trying to call your backend Auth Service, but the authentication is failing.

---

## Root Causes & Solutions

### 1. Backend Auth Service Not Running ⚠️

**Check if it's running:**
```bash
# Test if auth service is accessible
curl http://localhost:8001/health

# Should return: {"status": "ok", "service": "auth-service"}
```

**If it fails, start the auth service:**
```bash
cd backend/auth-service
go run main.go
```

**Expected output:**
```
✅ Database connected successfully
✅ Redis connected successfully
🚀 Auth Service starting on port 8001
```

---

### 2. No User Account Exists

The backend might be running, but **you haven't registered a user yet**.

**Solution: Register a user first**

```bash
# Register a new user
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "jobseeker"
  }'
```

**Expected response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "role": "jobseeker"
  }
}
```

**Then try logging in with:**
- Email: `test@example.com`
- Password: `test123`

---

### 3. Frontend Not Restarted After .env Changes

If you added/changed `.env.local`, you **MUST restart** the Next.js dev server.

```bash
# Stop the server (Ctrl+C)
# Then restart
cd frontend
npm run dev
```

---

### 4. Database Not Migrated

The auth service needs the database schema to exist.

**Check if you ran migrations:**
```bash
cd docs
node migrate.js
```

---

## Quick Test Script

Run this to test the entire login flow:

```bash
#!/bin/bash

echo "🔍 Testing Login Flow..."

# 1. Check auth service
echo "\n1. Checking Auth Service..."
curl -s http://localhost:8001/health || echo "❌ Auth service not running!"

# 2. Register test user
echo "\n2. Registering test user..."
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "jobseeker"
  }' | jq

# 3. Test login directly
echo "\n3. Testing login..."
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }' | jq

echo "\n✅ If you see a token above, backend is working!"
echo "Now try logging in through the frontend at http://localhost:3000/login"
```

---

## Step-by-Step Fix

### Step 1: Start ALL Backend Services

```bash
# Terminal 1: Infrastructure (Kafka, Redis)
cd docker
docker-compose up -d

# Terminal 2: Auth Service
cd backend/auth-service
go run main.go

# Terminal 3: User Service (for profile later)
cd backend/user-service
go run main.go

# Terminal 4: Job Service
cd backend/job-service
go run main.go

# Terminal 5: Frontend
cd frontend
npm run dev
```

### Step 2: Register a User via API

```bash
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com", 
    "password": "password123",
    "role": "jobseeker"
  }'
```

### Step 3: Try Logging In

Go to `http://localhost:3000/login` and use:
- **Email**: `john@example.com`
- **Password**: `password123`

---

## Common Errors & Fixes

### Error: "Connection refused"
**Problem**: Auth service not running
**Fix**: Start auth service (`cd backend/auth-service && go run main.go`)

### Error: "Invalid credentials"
**Problem**: User doesn't exist or wrong password
**Fix**: Register user first (see Step 2 above)

### Error: "Database connection failed"
**Problem**: Database not set up
**Fix**: Run `node docs/migrate.js`

### Error: "NEXTAUTH_SECRET is not set"
**Problem**: Frontend env vars missing
**Fix**: Check `.env.local` has `NEXTAUTH_SECRET` set

---

## Verify Everything Works

After starting services and registering a user:

1. ✅ Auth service health check:
   ```bash
   curl http://localhost:8001/health
   ```

2. ✅ Direct login test:
   ```bash
   curl -X POST http://localhost:8001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"password123"}'
   ```

3. ✅ Frontend login:
   - Go to http://localhost:3000/login
   - Enter credentials
   - Should redirect to /dashboard

---

## Still Not Working?

Check the **browser console** (F12) for errors and **backend terminal logs** for specific error messages.

Common issues:
- CORS errors → Check CORS middleware in auth service
- Network errors → Verify port 8001 is accessible
- Token errors → Check JWT_SECRET matches in both services
