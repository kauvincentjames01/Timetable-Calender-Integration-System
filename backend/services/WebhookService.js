import { WebhookRepository } from '../repositories/WebhookRepository.js';
import { GoogleCalendarService } from './GoogleCalendarService.js';

export class WebhookService {
  static async triggerOnEventCreate(eventData) {
    try {
      const webhooks = await WebhookRepository.findAll();
      
      for (const webhook of webhooks) {
        try {
          if (webhook.google_access_token) {
            await GoogleCalendarService.createEvent(webhook.google_access_token, eventData);
            await WebhookRepository.updateLastTriggered(webhook.id);
            console.log(`[WEBHOOK] Event created in Google Calendar for webhook ${webhook.id}`);
          }
        } catch (error) {
          console.error(`[WEBHOOK] Failed to push event to Google Calendar for webhook ${webhook.id}:`, error.message);
          // Don't deactivate on single failure; could be temporary
        }
      }
    } catch (error) {
      console.error('[WEBHOOK] Error triggering create webhook:', error.message);
    }
  }

  static async triggerOnEventUpdate(eventId, eventData) {
    try {
      const webhooks = await WebhookRepository.findAll();
      
      for (const webhook of webhooks) {
        try {
          if (webhook.google_access_token) {
            // Use course_code as a simple unique identifier for the Google Calendar event
            const googleEventId = eventData.course_code.split(' ').join('') + '-' + eventId;
            await GoogleCalendarService.updateEvent(webhook.google_access_token, googleEventId, eventData);
            await WebhookRepository.updateLastTriggered(webhook.id);
            console.log(`[WEBHOOK] Event updated in Google Calendar for webhook ${webhook.id}`);
          }
        } catch (error) {
          console.error(`[WEBHOOK] Failed to update event in Google Calendar for webhook ${webhook.id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('[WEBHOOK] Error triggering update webhook:', error.message);
    }
  }

  static async triggerOnEventDelete(eventId, eventData) {
    try {
      const webhooks = await WebhookRepository.findAll();
      
      for (const webhook of webhooks) {
        try {
          if (webhook.google_access_token) {
            const googleEventId = eventData.course_code.split(' ').join('') + '-' + eventId;
            await GoogleCalendarService.deleteEvent(webhook.google_access_token, googleEventId);
            await WebhookRepository.updateLastTriggered(webhook.id);
            console.log(`[WEBHOOK] Event deleted from Google Calendar for webhook ${webhook.id}`);
          }
        } catch (error) {
          console.error(`[WEBHOOK] Failed to delete event from Google Calendar for webhook ${webhook.id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('[WEBHOOK] Error triggering delete webhook:', error.message);
    }
  }

  static async registerWebhook(token_id, googleTokens) {
    try {
      const webhook = await WebhookRepository.create({
        token_id,
        calendar_id: 'primary',
        google_access_token: googleTokens.access_token,
        google_refresh_token: googleTokens.refresh_token,
        webhook_url: process.env.APP_URL || 'http://localhost:3000'
      });
      console.log(`[WEBHOOK] Registered webhook ${webhook.id} for token ${token_id}`);
      return webhook;
    } catch (error) {
      console.error('[WEBHOOK] Failed to register webhook:', error.message);
      throw error;
    }
  }

  static async deactivateWebhook(webhook_id) {
    try {
      await WebhookRepository.deactivate(webhook_id);
      console.log(`[WEBHOOK] Deactivated webhook ${webhook_id}`);
    } catch (error) {
      console.error('[WEBHOOK] Failed to deactivate webhook:', error.message);
      throw error;
    }
  }
}
