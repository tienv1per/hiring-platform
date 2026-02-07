# Gmail SMTP Setup Guide

This guide will help you configure Gmail SMTP for sending emails from the job portal (password reset, application notifications, etc.).

---

## What is SMTP?

**SMTP (Simple Mail Transfer Protocol)** is the standard protocol for sending emails. We use Gmail's SMTP server to send:
- Password reset emails
- Job application notifications
- Application status updates
- Subscription emails

---

## Prerequisites

- A Gmail account
- 2-Step Verification enabled (required for App Passwords)

---

## Step 1: Enable 2-Step Verification

### Why is this needed?

Google requires 2-Step Verification to generate App Passwords for third-party applications.

### How to Enable

1. Go to your **Google Account**: https://myaccount.google.com/
2. Click **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Click **Get Started**
5. Follow the prompts to set up (usually phone verification)

![Google 2-Step Verification](https://lh3.googleusercontent.com/...)

---

## Step 2: Generate App Password

### What is an App Password?

An App Password is a 16-character code that lets apps access your Gmail account without your regular password. It's more secure and can be revoked independently.

### Steps to Generate

1. Go to **Google Account** → **Security**
2. Under "Signing in to Google", find **2-Step Verification**
3. Scroll down to **App passwords** and click it
4. You may need to re-enter your password

![App Passwords Section](https://support.google.com/...)

5. **Select app**: Choose **"Mail"**
6. **Select device**: Choose **"Other (Custom name)"**
7. Enter a name: `Job Portal Server`
8. Click **Generate**

![Generate App Password](https://support.google.com/...)

9. **Copy the 16-character password** (format: `abcd efgh ijkl mnop`)

> ⚠️ **Important**: This password is shown **only once**! Save it immediately.

---

## Step 3: Configure Environment Variables

Add your Gmail credentials to the `.env` file:

```bash
# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```

**Replace:**
- `your-email@gmail.com` → Your actual Gmail address
- `abcd efgh ijkl mnop` → The 16-character App Password (with or without spaces)

**Example:**
```bash
SMTP_USER=jobportal2024@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
```

**File location:**
```
job-portal/
├── .env          ← Add SMTP config here
└── backend/
    └── utility-service/
```

---

## Step 4: Understand SMTP Settings

### Gmail SMTP Configuration

| Setting | Value |
|---------|-------|
| **Host** | `smtp.gmail.com` |
| **Port** | `587` (TLS) or `465` (SSL) |
| **Security** | TLS/STARTTLS |
| **Authentication** | Required |

We use **port 587** with STARTTLS (most common and reliable).

### Why Port 587?

- **Port 587**: Modern, STARTTLS encryption (recommended)
- **Port 465**: Legacy, SSL encryption
- **Port 25**: Blocked by most ISPs

---

## Step 5: Test Email Sending

### Start Kafka and Utility Service

```bash
# Terminal 1: Start Kafka
cd docker
docker-compose up -d

# Terminal 2: Start Utility Service
cd backend/utility-service
go run main.go
```

**Expected output:**
```
✅ Kafka producer initialized
✅ Kafka consumer started
🚀 Utility Service starting on port 8004
📧 Kafka email consumer running in background
```

### Send Test Email

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-test-email@example.com",
    "subject": "Test Email from Job Portal",
    "body": "This is a test email. If you receive this, Gmail SMTP is working correctly!",
    "type": "test"
  }' \
  http://localhost:8004/api/email/send
```

**Expected response:**
```json
{
  "message": "Email event sent to Kafka successfully"
}
```

### Check Logs

In the utility-service terminal, you should see:

```
📧 Email event produced: test to your-test-email@example.com
📬 Processing email event: test to your-test-email@example.com
✅ Email sent successfully to your-test-email@example.com
```

### Check Your Inbox

Check the recipient email inbox. You should receive the test email within seconds!

---

## Troubleshooting

### Error: "535 Authentication failed"

**Cause:** Incorrect credentials or App Password not set

**Solution:**
1. Verify `SMTP_USER` is your full Gmail address
2. Regenerate App Password:
   - Go to Google Account → Security → App Passwords
   - Delete old password
   - Generate new one
3. Update `.env` with new password (no spaces)
4. Restart utility service

### Error: "534 Application-specific password required"

**Cause:** Trying to use regular password instead of App Password

**Solution:**
1. Enable 2-Step Verification (see Step 1)
2. Generate App Password (see Step 2)
3. Use App Password in `SMTP_PASSWORD`, not your regular Gmail password

### Error: "SMTP configuration not set"

**Cause:** Environment variables missing

**Solution:**
1. Check `.env` file exists in project root
2. Verify all SMTP variables are set:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```
3. Restart service

### Error: "dial tcp: i/o timeout"

**Cause:** Firewall blocking port 587 or network issue

**Solution:**
1. Check internet connection
2. Try port 465 instead:
   ```bash
   SMTP_PORT=465
   ```
3. Check corporate firewall settings
4. Try from different network

### Email Not Arriving

**Possible Causes:**

1. **Spam Folder**: Check spam/junk folder
2. **Gmail Limits**: Gmail has sending limits (500 emails/day for free accounts)
3. **Kafka Not Running**: Ensure Kafka is running with `docker-compose ps`
4. **Consumer Not Processing**: Check utility-service logs

---

## Gmail Sending Limits

### Free Gmail Account

- **Daily limit**: 500 emails
- **Per email**: Up to 500 recipients
- **Attachment size**: 25 MB

### Google Workspace Account

- **Daily limit**: 2,000 emails (per user)
- **Larger limits available**

### For Production

If you need to send more emails:

1. **Use Google Workspace**: Higher limits
2. **Use SendGrid/Mailgun**: Dedicated email services
3. **Multiple accounts**: Rotate between accounts

---

## Best Practices

### 1. Use Dedicated Email Account

Create a separate Gmail account for the application:

```
jobportal.notifications@gmail.com
```

**Benefits:**
- Separate from personal email
- Easier to monitor
- Can be shared with team

### 2. Set "From" Name

Modify email headers to use friendly name:

```go
message := []byte(fmt.Sprintf(
    "From: Job Portal <%s>\r\n"+
    "To: %s\r\n"+
    "Subject: %s\r\n"+
    "\r\n"+
    "%s\r\n", smtpUser, to, subject, body))
```

### 3. HTML Email Templates

For production, use HTML templates:

```go
body := `
<!DOCTYPE html>
<html>
<body>
    <h1>Welcome to Job Portal</h1>
    <p>Your password reset link: <a href="...">Click here</a></p>
</body>
</html>
`
```

### 4. Use MIME for Rich Emails

Support both HTML and plain text:

```go
import "net/mail"
import "mime/multipart"

// Create multipart message with HTML and plain text versions
```

### 5. Security

- ✅ Never commit `.env` to Git (already in `.gitignore`)
- ✅ Use App Passwords, not regular passwords
- ✅ Rotate passwords periodically
- ✅ Revoke unused App Passwords

---

## Alternative SMTP Providers

If Gmail doesn't work for you:

### SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### Mailgun

```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

### AWS SES

```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

---

## Email Flow Architecture

```
Application → Kafka Producer → Kafka Topic → Kafka Consumer → SMTP Client → Gmail Server → Recipient
```

**Benefits:**
- ✅ **Asynchronous**: Don't block API requests
- ✅ **Reliable**: Kafka ensures delivery
- ✅ **Scalable**: Can add more consumers
- ✅ **Decoupled**: Services don't directly depend on SMTP

---

## Monitoring Email Delivery

### Check Kafka Consumer Logs

```bash
# In utility-service terminal
📧 Email event produced: password-reset to user@example.com
📬 Processing email event: password-reset to user@example.com
✅ Email sent successfully to user@example.com
```

### Failed Emails

If emails fail, you'll see:

```
📬 Processing email event: test to invalid@example.com
Failed to send email: 550 No such user
```

In production, implement:
- **Retry logic**: Retry failed emails
- **Dead letter queue**: Store permanently failed emails
- **Alerts**: Notify team of SMTP issues

---

## Quick Reference

| Config | Value |
|--------|-------|
| **SMTP Host** | `smtp.gmail.com` |
| **SMTP Port** | `587` (TLS) |
| **Auth Required** | Yes (App Password) |
| **Daily Limit** | 500 emails (free Gmail) |
| **Setup URL** | https://myaccount.google.com/security |

---

## Next Steps

After setup:

1. ✅ Test with multiple recipients
2. ✅ Create email templates
3. ✅ Implement retry logic
4. ✅ Set up monitoring
5. ✅ Document email types in code

---

Your email system is ready! 📧✨
