# Google Gemini API Setup Guide

This guide will help you set up Google Gemini API for the AI features in the job portal (career guidance and resume analysis).

---

## What is Google Gemini?

Google Gemini is Google's most capable AI model, offering advanced natural language understanding and generation. We use it for:
- **Career Guidance**: Personalized career advice based on skills and goals
- **Resume Analysis**: ATS scoring and improvement suggestions

---

## Step 1: Access Google AI Studio

1. Go to **Google AI Studio**: https://ai.google.dev/
2. Click **"Get API Key"** or **"Get started"**
3. Sign in with your Google account

![Google AI Studio Homepage](https://ai.google.dev/static/site-assets/images/marketing/home-ai-studio.png)

---

## Step 2: Create or Select a Project

### Option A: Create New Project

1. On the API Keys page, click **"Create API key"**
2. Select **"Create API key in new project"**
3. Wait a few seconds for the project to be created

### Option B: Use Existing Project

1. If you have existing Google Cloud projects, select **"Create API key in existing project"**
2. Choose your project from the dropdown

---

## Step 3: Get Your API Key

1. After project creation, your API key will be displayed
2. **Copy the API key** (format: `AIzaSy...`)
3. Click **"Show API key"** if you need to view it again

**Example API Key:**
```
AIzaSyDXg5...your-actual-key...xyz123
```

> ⚠️ **Security Warning**: Keep your API key secret! Never commit it to Git.

---

## Step 4: Configure Environment Variables

Add your API key to the `.env` file in the project root:

```bash
# Google Gemini AI Configuration
GEMINI_API_KEY=AIzaSyDXg5...your-actual-key...xyz123
```

**File location:**
```
job-portal/
├── .env          ← Add GEMINI_API_KEY here
└── backend/
    └── utility-service/
```

---

## Step 5: Verify API Key

Test the API key by running the utility service:

```bash
cd backend/utility-service
go run main.go
```

**Expected output:**
```
✅ Google Gemini AI client initialized
```

If you see this message, your API key is working correctly!

**If you see:**
```
⚠️  GEMINI_API_KEY not set, AI features will be unavailable
```
Double-check your `.env` file configuration.

---

## Step 6: Test AI Endpoints

### Test Career Guidance

```bash
# First, get a JWT token by logging in
# Then use the token to call the AI endpoint

curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "skills": ["Python", "Django"],
    "experience": "2 years backend development",
    "goals": "Become a senior engineer"
  }' \
  http://localhost:8004/api/ai/career-guide
```

### Test Resume Analysis

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resume_text": "John Doe - Software Engineer with 5 years experience...",
    "job_description": "Looking for Senior Backend Engineer..."
  }' \
  http://localhost:8004/api/ai/resume-analyze
```

---

## API Usage Limits

### Free Tier (No Credit Card Required)

- **Requests per minute (RPM)**: 15
- **Requests per day (RPD)**: 1,500
- **Tokens per minute (TPM)**: 1 million

This is **more than enough** for development and testing!

### Rate Limit Example

For a job portal with 100 daily active users:
- Career guidance: ~10 requests/day
- Resume analysis: ~20 requests/day
- **Total**: ~30 requests/day (well within 1,500 limit)

---

## Troubleshooting

### Error: "API key not valid"

**Cause:** Invalid or incorrect API key

**Solution:**
1. Go back to https://ai.google.dev/
2. Click on **"Get API Key"**
3. **Copy the key again** (don't type it manually)
4. Update `.env` file
5. Restart the service

### Error: "GEMINI_API_KEY not set"

**Cause:** Environment variable not loaded

**Solution:**
1. Verify `.env` file exists in project root
2. Check the key name is exactly `GEMINI_API_KEY`
3. Restart the Go service
4. Check if `godotenv` is loading `.env` correctly

### Error: "Rate limit exceeded"

**Cause:** Too many requests in short time

**Solution:**
- Wait 1 minute before retrying
- Implement request caching in production
- Consider upgrading to paid tier if needed

### Error: "Model not found"

**Cause:** Using unavailable model name

**Solution:**
- Code uses `gemini-pro` (default model)
- This should always be available
- Check Google AI Studio for model availability

---

## Best Practices

### 1. Environment-Specific Keys

Use different API keys for different environments:

```bash
# Development
GEMINI_API_KEY=AIzaSy...dev-key...

# Production
GEMINI_API_KEY=AIzaSy...prod-key...
```

### 2. Error Handling

The service gracefully handles API failures:
```go
if client == nil {
    return "", fmt.Errorf("Gemini client not initialized")
}
```

Users see friendly error messages instead of crashes.

### 3. Request Caching

For production, cache common requests:
```go
// Cache career guidance for same skill combinations
// Cache resume analysis for same resume text
```

### 4. Monitoring

Track API usage to stay within limits:
- Log all Gemini API calls
- Monitor response times
- Set up alerts for errors

---

## API Key Management

### Rotating API Keys

If your key is compromised:

1. Go to Google AI Studio
2. **Disable the old key**
3. **Create a new API key**
4. Update `.env` with new key
5. Restart all services

### Multiple Keys

For high-traffic applications:
- Create multiple API keys
- Implement round-robin or load balancing
- Each key has separate rate limits

---

## Additional Resources

- **Google AI Studio**: https://ai.google.dev/
- **Gemini API Docs**: https://ai.google.dev/docs
- **Pricing**: https://ai.google.dev/pricing
- **Model Guide**: https://ai.google.dev/models/gemini

---

## Quick Reference

| Item | Value |
|------|-------|
| **API Console** | https://ai.google.dev/ |
| **Free RPM** | 15 requests/minute |
| **Free RPD** | 1,500 requests/day |
| **Model Name** | `gemini-pro` |
| **Env Var** | `GEMINI_API_KEY` |

---

You're all set! Your job portal now has AI-powered features. 🤖✨
