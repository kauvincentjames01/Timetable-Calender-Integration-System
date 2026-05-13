import { TokenService } from '../services/TokenService.js';
import { SyncService } from '../services/SyncService.js';

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
      return res.status(200).json({ feed_url: feedUrl });
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
      res.setHeader('Content-Disposition', 'attachment; filename="timetable.ics"');
      // Set short caching for external providers
      res.setHeader('Cache-Control', 'public, max-age=300'); 
      return res.status(200).send(icsData);
    } catch (error) {
      if (error.message === 'UNAUTHORIZED') {
        return res.status(403).send('Invalid or expired subscription token');
      }
      next(error);
    }
  }
}
