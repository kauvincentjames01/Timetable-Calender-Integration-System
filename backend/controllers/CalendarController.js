import { TokenService } from '../services/TokenService.js';
import { SyncService } from '../services/SyncService.js';
import { GoogleCalendarService } from '../services/GoogleCalendarService.js';
import { WebhookService } from '../services/WebhookService.js';

export class CalendarController {
  
  // POST /api/subscribe
  static async handleSubscription(req, res, next) {
    try {
      const { reg_number } = req.body;
      
      if (!reg_number) {
        return res.status(400).json({ error: 'reg_number is required' });
      }

      const token = await TokenService.getOrCreateFeedToken(reg_number);
      
      // Ensure the correct protocol and host are grabbed. For proxies (like Cloud Run) req.hostname 
      // or x-forwarded-host can be better, but APP_URL is the safest fallback if properly configured.
      let appUrl = process.env.APP_URL;
      
      if (!appUrl || appUrl === 'MY_APP_URL') {
         // Fallback logic trying to construct the url
         const host = req.get('x-forwarded-host') || req.get('host');
         const protocol = req.get('x-forwarded-proto') || req.protocol;
         appUrl = `${protocol}://${host}`;
      }
      
      const feedUrl = `${appUrl}/api/feed/${token}`;
      return res.status(200).json({ 
        feed_url: feedUrl,
        oauth_url: `${appUrl}/api/calendar/oauth-url?token=${token}`
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/calendar/oauth-url
  static async getOAuthUrl(req, res, next) {
    try {
      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(400).json({ error: 'Google OAuth is not configured on the server' });
      }

      const oauthUrl = GoogleCalendarService.getAuthorizationUrl();
      res.json({ oauth_url: oauthUrl });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/calendar/oauth-callback
  static async handleOAuthCallback(req, res, next) {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code not provided' });
      }

      const tokens = await GoogleCalendarService.exchangeCodeForTokens(code);
      
      // Redirect to frontend with token (in production, pass it securely)
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      res.redirect(`${appUrl}?google_access_token=${tokens.access_token}&google_refresh_token=${tokens.refresh_token || ''}`);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/calendar/register-webhook
  static async registerWebhook(req, res, next) {
    try {
      const { token, google_access_token, google_refresh_token } = req.body;
      
      if (!token || !google_access_token) {
        return res.status(400).json({ error: 'token and google_access_token are required' });
      }

      // Get the token record to find token_id
      const tokenRecord = await SyncService.mapIdentity(token);
      if (!tokenRecord) {
        return res.status(403).json({ error: 'Invalid or expired subscription token' });
      }

      const webhook = await WebhookService.registerWebhook(tokenRecord.id, {
        access_token: google_access_token,
        refresh_token: google_refresh_token
      });

      res.status(201).json({
        message: 'Webhook registered successfully',
        webhook_id: webhook.id
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/feed/:token
  static async serveFeed(req, res, next) {
    try {
      const { token } = req.params;

      if (!token || token.length !== 64) {
        return res.status(403).send('Invalid token structure');
      }

      const icsData = await SyncService.generateFeed(token);
      
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'inline; filename="timetable.ics"');
      res.setHeader('Cache-Control', 'public, max-age=600, must-revalidate');
      res.setHeader('ETag', `"${Buffer.from(icsData).toString('base64').substring(0, 16)}"`);
      return res.status(200).send(icsData);
    } catch (error) {
      if (error.message === 'UNAUTHORIZED') {
        return res.status(403).send('Invalid or expired subscription token');
      }
      next(error);
    }
  }
}
