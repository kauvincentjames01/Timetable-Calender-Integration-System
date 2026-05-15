# Google Calendar Instant Sync Setup Guide

## Problem
When you add a new lecture, it doesn't appear in Google Calendar because webhooks aren't registered yet.

## Solution: Complete the OAuth Flow

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Enable the **Google Calendar API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Add these **Authorized Redirect URIs**:
     - `http://localhost:3000/api/calendar/oauth-callback`
     - `http://localhost:3000`
   - Copy your **Client ID** and **Client Secret**

### Step 2: Configure .env File

Update `d:\my projects\Timetable-Calender-Integration-System\.env`:

```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/calendar/oauth-callback
APP_URL=http://localhost:3000
```

### Step 3: Check Webhook Status

Run this command to verify setup:

```bash
curl http://localhost:3000/api/diagnostic/webhook-status
```

Expected response:
```json
{
  "status": "warning",
  "message": "No webhooks registered. Follow the OAuth setup to enable instant sync.",
  "google_oauth_configured": true,
  "active_webhooks": 0
}
```

### Step 4: Authorize Google Calendar Access

1. Get the OAuth URL:
```bash
curl http://localhost:3000/api/diagnostic/oauth-setup
```

2. Click the returned `oauth_url` and authorize the app
3. You'll be redirected with this format:
   ```
   http://localhost:3000?google_access_token=ya29....&google_refresh_token=1//0...
   ```

4. Extract the tokens from the URL and register the webhook:

```bash
curl -X POST http://localhost:3000/api/calendar/register-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "token": "your-64-char-feed-token",
    "google_access_token": "ya29...",
    "google_refresh_token": "1//0..."
  }'
```

### Step 5: Verify Connection

Test if webhooks are working:

```bash
curl -X POST http://localhost:3000/api/diagnostic/test-google-connection \
  -H "Content-Type: application/json" \
  -d '{"access_token": "ya29..."}'
```

### Step 6: Add a New Lecture

Now when you add a lecture in the admin dashboard:
```
POST /api/admin/timetable
{
  "course_code": "CSC 3201",
  "course_name": "Computer Networks II",
  "lecturer": "Prof. Engineer",
  "location": "CIT Lab 4",
  "day_of_week": 1,
  "start_time": "10:00",
  "end_time": "13:00"
}
```

**It will instantly appear in your Google Calendar!**

---

## Troubleshooting

### "No webhooks registered"
- You haven't completed the OAuth flow yet
- Follow steps 1-4 above

### "Google OAuth not configured"
- Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Restart the server

### "Failed to create test event"
- Check the error message - usually means:
  - Invalid `access_token` (expired or wrong)
  - Google Calendar API not enabled in your Cloud project
  - Redirect URI doesn't match in Google Cloud Console

### Still not appearing in Google Calendar?
- Check browser console for errors
- Verify tokens are being stored: `SELECT * FROM webhooks;`
- Check server logs for `[WEBHOOK]` messages
- Make sure you're using the same Google account in both places

## API Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/diagnostic/webhook-status` | GET | Check if webhooks are registered |
| `/api/diagnostic/oauth-setup` | GET | Get OAuth authorization URL |
| `/api/diagnostic/test-google-connection` | POST | Test if Google Calendar access works |
| `/api/calendar/register-webhook` | POST | Register a webhook after OAuth |
| `/api/subscribe` | POST | Subscribe to the timetable feed |
