# Auth Service

JWT-based authentication service for the job portal application.

## Features

- ✅ User registration with role selection (jobseeker/recruiter)
- ✅ User login with JWT token generation
- ✅ Password hashing with bcrypt
- ✅ Forgot password with Redis-cached tokens (15min expiry)
- ✅ Password reset with token validation
- ✅ CORS enabled for frontend communication

## API Endpoints

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "jobseeker"
}
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "jobseeker",
    ...
  }
}
```

### POST /api/auth/login
Authenticate and get JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### POST /api/auth/forgot-password
Request password reset token.

**Request:**
```json
{
  "email": "john@example.com"
}
```

### POST /api/auth/reset-password
Reset password with token.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "new_password": "newpassword123"
}
```

## Environment Variables

Required in `.env` file:
```bash
DATABASE_URL=postgresql://...
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
AUTH_SERVICE_PORT=8001
```

## Running the Service

```bash
# Install dependencies
go mod download

# Run the service
go run main.go
```

The service will start on port 8001 (or PORT from env).

## Architecture

```
auth-service/
├── main.go              # Entry point
├── config/              # Database & Redis config
├── handlers/            # HTTP handlers
├── middleware/          # CORS, auth middleware
├── models/              # Data models & DTOs
└── utils/               # JWT, password utils
```
