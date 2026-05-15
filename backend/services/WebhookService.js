import { WebhookRepository } from '../repositories/WebhookRepository.js';
import { GoogleCalendarService } from './GoogleCalendarService.js';

export class WebhookService {
  // Convert event with day_of_week + time to ISO datetime string
  static formatEventForGoogle(eventData) {
    const now = new Date();
    const monday = new Date(now);
    const day = now.getDay() || 7;
    monday.setDate(now.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);

    const getDayTime = (daysFromMonday, timeString) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + daysFromMonday);
      const [hours, minutes] = timeString.split(':').map(Number);
      d.setHours(hours, minutes, 0);
      return d.toISOString();
    };

    return {
      course_code: eventData.course_code,
      course_name: eventData.course_name,
      lecturer: eventData.lecturer,
      location: eventData.location,
      start_time: getDayTime(eventData.day_of_week || 0, eventData.start_time),
      end_time: getDayTime(eventData.day_of_week || 0, eventData.end_time),
      id: eventData.id
    };
  }

  static async triggerOnEventCreate(eventData) {
    try {
      const webhooks = await WebhookRepository.findAll();
      
      if (webhooks.length === 0) {
        console.log('[WEBHOOK] No active webhooks registered. Events won\'t sync to Google Calendar.');
        return;
      }

      const formattedEvent = this.formatEventForGoogle(eventData);

      for (const webhook of webhooks) {
        try {
          if (webhook.google_access_token) {
            await GoogleCalendarService.createEvent(webhook.google_access_token, formattedEvent);
            await WebhookRepository.updateLastTriggered(webhook.id);
            console.log(`[WEBHOOK] Event created in Google Calendar for webhook ${webhook.id}: ${formattedEvent.course_code}`);
          }
        } catch (error) {
          console.error(`[WEBHOOK] Failed to push event to Google Calendar for webhook ${webhook.id}:`, error.message);
        }
      }
    } catch (error) {
      console.error('[WEBHOOK] Error triggering create webhook:', error.message);
    }
  }

  static async triggerOnEventUpdate(eventId, eventData) {
    try {
      const webhooks = await WebhookRepository.findAll();
      
      if (webhooks.length === 0) {
        console.log('[WEBHOOK] No active webhooks registered.');
        return;
      }

      const formattedEvent = this.formatEventForGoogle(eventData);

      for (const webhook of webhooks) {
        try {
          if (webhook.google_access_token) {
            const googleEventId = formattedEvent.course_code.split(' ').join('') + '-' + eventId;
            await GoogleCalendarService.updateEvent(webhook.google_access_token, googleEventId, formattedEvent);
            await WebhookRepository.updateLastTriggered(webhook.id);
            console.log(`[WEBHOOK] Event updated in Google Calendar for webhook ${webhook.id}: ${formattedEvent.course_code}`);
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
      
      if (webhooks.length === 0) {
        console.log('[WEBHOOK] No active webhooks registered.');
        return;
      }

      const formattedEvent = this.formatEventForGoogle(eventData);

      for (const webhook of webhooks) {
        try {
          if (webhook.google_access_token) {
            const googleEventId = formattedEvent.course_code.split(' ').join('') + '-' + eventId;
            await GoogleCalendarService.deleteEvent(webhook.google_access_token, googleEventId);
            await WebhookRepository.updateLastTriggered(webhook.id);
            console.log(`[WEBHOOK] Event deleted from Google Calendar for webhook ${webhook.id}: ${formattedEvent.course_code}`);
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

  static async listActiveWebhooks() {
    try {
      return await WebhookRepository.findAll();
    } catch (error) {
      console.error('[WEBHOOK] Failed to list webhooks:', error.message);
      throw error;
    }
  }
}
