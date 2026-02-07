# Job Portal Web Application

A microservice-based job portal with AI-powered features, built with Next.js, Golang, PostgreSQL, and Kafka.

## Features

- **Multi-Account Authentication**: NextAuth.js with role-based access (Job Seekers & Recruiters)
- **AI Career Guidance**: Personalized career path suggestions using Google Gemini API
- **AI Resume Analyzer**: ATS score analysis with strengths and weaknesses
- **Markdown Job Descriptions**: Rich text editor for recruiter job postings
- **Async Email Notifications**: Kafka-based messaging system
- **File Uploads**: Resume and profile picture uploads via Cloudinary
- **Responsive Design**: Mobile-first with dark mode support

## Tech Stack

### Frontend
- Next.js 14+ with TypeScript
- Shadcn/UI components
- Tailwind CSS
- NextAuth.js for authentication
- @uiw/react-md-editor for markdown editing

### Backend
- Golang with Gin framework
- PostgreSQL (Neon DB)
- Apache Kafka for messaging
- Redis for caching
- Cloudinary for file storage

### Infrastructure
- Docker & Docker Compose
- AWS (planned deployment)

## Getting Started

### Prerequisites
- Node.js 18+
- Go 1.21+
- Docker & Docker Compose
- PostgreSQL (Neon DB account)
- Cloudinary account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd job-portal
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Start infrastructure services**
   ```bash
   cd docker
   docker-compose up -d
   ```

4. **Set up database**
   - Create a database in Neon DB
   - Run the schema:
   ```bash
   psql $DATABASE_URL -f docs/database-schema.sql
   ```

5. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

6. **Install backend dependencies** (for each service)
   ```bash
   cd backend/auth-service
   go mod init auth-service
   go mod tidy
   ```

### Running the Application

**Start all services:**

1. Infrastructure (Kafka, Redis):
   ```bash
   docker-compose -f docker/docker-compose.yml up
   ```

2. Backend services (in separate terminals):
   ```bash
   cd backend/auth-service && go run main.go
   cd backend/user-service && go run main.go
   cd backend/job-service && go run main.go
   cd backend/utility-service && go run main.go
   ```

3. Frontend:
   ```bash
   cd frontend && npm run dev
   ```

Access the application at `http://localhost:3000`

## Project Structure

```
job-portal/
├── frontend/              # Next.js application
├── backend/
│   ├── auth-service/      # Authentication microservice
│   ├── user-service/      # User management
│   ├── job-service/       # Job & company management
│   └── utility-service/   # Kafka, email, file uploads, AI
├── docker/                # Docker configurations
└── docs/                  # Documentation
```

## API Documentation

- Auth Service: http://localhost:8001
- User Service: http://localhost:8002
- Job Service: http://localhost:8003
- Utility Service: http://localhost:8004

## Development Timeline

See [implementation_plan.md](docs/implementation_plan.md) for detailed development phases.

## License

MIT
