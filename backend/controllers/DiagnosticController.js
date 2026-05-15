import { WebhookService } from '../services/WebhookService.js';
import { GoogleCalendarService } from '../services/GoogleCalendarService.js';

export class DiagnosticController {
  static async checkWebhookStatus(req, res, next) {
    try {
      const webhooks = await WebhookService.listActiveWebhooks();
      
      const hasGoogleCredentials = !!process.env.GOOGLE_CLIENT_ID;
      const webhookCount = webhooks.length;
      
      return res.json({
        status: webhookCount > 0 ? 'success' : 'warning',
        message: webhookCount > 0 
          ? `Found ${webhookCount} active webhook(s). Events will sync instantly.`
          : 'No webhooks registered. Follow the OAuth setup to enable instant sync.',
        google_oauth_configured: hasGoogleCredentials,
        active_webhooks: webhookCount,
        webhooks: webhooks.map(w => ({
          id: w.id,
          has_access_token: !!w.google_access_token,
          last_triggered: w.last_triggered,
          created_at: w.created_at
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOAuthSetupUrl(req, res, next) {
    try {
      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(400).json({
          error: 'Google OAuth not configured',
          message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file'
        });
      }

      const oauthUrl = GoogleCalendarService.getAuthorizationUrl();
      return res.json({
        message: 'Visit this URL to authorize Google Calendar access',
        oauth_url: oauthUrl,
        instructions: [
          '1. Click the oauth_url',
          '2. Sign in with your Google account',
          '3. Authorize the app to access your calendar',
          '4. Copy the tokens from the redirect URL',
          '5. POST to /api/calendar/register-webhook with the tokens'
        ]
      });
    } catch (error) {
      next(error);
    }
  }

  static async testGoogleCalendarConnection(req, res, next) {
    try {
      const { access_token } = req.body;
      
      if (!access_token) {
        return res.status(400).json({ error: 'access_token is required' });
      }

      // Try to create a test event
      const testEvent = {
        course_code: 'TEST-SYNC',
        course_name: 'Test Sync Event',
        lecturer: 'Test Lecturer',
        location: 'Test Location',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString()
      };

      await GoogleCalendarService.createEvent(access_token, testEvent);
      
      return res.json({
        status: 'success',
        message: 'Successfully created test event in Google Calendar. Webhooks are working!'
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create test event',
        error: error.message
      });
    }
  }
}
