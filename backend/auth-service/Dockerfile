# ============================================
# Stage 1: Build
# ============================================
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install ca-certificates for HTTPS calls (Neon DB, etc.)
RUN apk add --no-cache ca-certificates

# Download dependencies first (cached layer)
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build static binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /auth-service .

# ============================================
# Stage 2: Runtime
# ============================================
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --from=builder /auth-service .

USER appuser

EXPOSE 8001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8001/health || exit 1

CMD ["./auth-service"]
