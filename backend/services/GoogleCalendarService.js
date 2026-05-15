import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleCalendarService {
  static getOAuthClient() {
    return new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/calendar/oauth-callback'
    );
  }

  static getAuthorizationUrl() {
    const oauth2Client = this.getOAuthClient();
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  static async exchangeCodeForTokens(code) {
    const oauth2Client = this.getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  static getCalendarApi(accessToken) {
    const auth = new OAuth2Client();
    auth.setCredentials({ access_token: accessToken });
    return google.calendar({ version: 'v3', auth });
  }

  static async createEvent(accessToken, eventData) {
    try {
      const calendar = this.getCalendarApi(accessToken);
      const event = {
        summary: `${eventData.course_code} - ${eventData.course_name}`,
        description: `Lecturer: ${eventData.lecturer}`,
        location: eventData.location,
        start: {
          dateTime: eventData.start_time,
          timeZone: 'Africa/Kampala'
        },
        end: {
          dateTime: eventData.end_time,
          timeZone: 'Africa/Kampala'
        },
        colorId: '1' // Blue color for academic events
      };

      const result = await calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });

      return result.data;
    } catch (error) {
      console.error('[GoogleCalendar] Failed to create event:', error.message);
      throw error;
    }
  }

  static async updateEvent(accessToken, eventId, eventData) {
    try {
      const calendar = this.getCalendarApi(accessToken);
      const event = {
        summary: `${eventData.course_code} - ${eventData.course_name}`,
        description: `Lecturer: ${eventData.lecturer}`,
        location: eventData.location,
        start: {
          dateTime: eventData.start_time,
          timeZone: 'Africa/Kampala'
        },
        end: {
          dateTime: eventData.end_time,
          timeZone: 'Africa/Kampala'
        },
        colorId: '1'
      };

      const result = await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event
      });

      return result.data;
    } catch (error) {
      console.error('[GoogleCalendar] Failed to update event:', error.message);
      throw error;
    }
  }

  static async deleteEvent(accessToken, eventId) {
    try {
      const calendar = this.getCalendarApi(accessToken);
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });
      return true;
    } catch (error) {
      console.error('[GoogleCalendar] Failed to delete event:', error.message);
      throw error;
    }
  }
}
