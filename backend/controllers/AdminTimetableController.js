import { TimetableRepository } from '../repositories/TimetableRepository.js';
import { WebhookService } from '../services/WebhookService.js';

export class AdminTimetableController {
  static async getEvents(req, res, next) {
    try {
      const events = await TimetableRepository.getAll();
      res.json(events);
    } catch (e) { next(e); }
  }

  static async createEvent(req, res, next) {
    try {
      const newEvent = await TimetableRepository.create(req.body);
      // Log the change
      console.log(`[TIMETABLE_CHANGE] Event created: ${newEvent.id} - ${newEvent.course_name}`);
      
      // Trigger webhooks for instant Google Calendar sync
      WebhookService.triggerOnEventCreate(newEvent).catch(err => 
        console.error('[WEBHOOK_ERROR] Failed to trigger create webhook:', err.message)
      );
      
      res.status(201).json(newEvent);
    } catch (e) { next(e); }
  }

  static async updateEvent(req, res, next) {
    try {
      const updatedEvent = await TimetableRepository.update(req.params.id, req.body);
      if (!updatedEvent) return res.status(404).json({ error: 'Event not found' });
      // Log the change
      console.log(`[TIMETABLE_CHANGE] Event updated: ${req.params.id} - ${updatedEvent.course_name}`);
      
      // Trigger webhooks for instant Google Calendar sync
      WebhookService.triggerOnEventUpdate(req.params.id, updatedEvent).catch(err =>
        console.error('[WEBHOOK_ERROR] Failed to trigger update webhook:', err.message)
      );
      
      res.json(updatedEvent);
    } catch (e) { next(e); }
  }

  static async deleteEvent(req, res, next) {
    try {
      const eventToDelete = await TimetableRepository.getById(req.params.id);
      await TimetableRepository.delete(req.params.id);
      // Log the change
      console.log(`[TIMETABLE_CHANGE] Event deleted: ${req.params.id}`);
      
      // Trigger webhooks for instant Google Calendar sync
      if (eventToDelete) {
        WebhookService.triggerOnEventDelete(req.params.id, eventToDelete).catch(err =>
          console.error('[WEBHOOK_ERROR] Failed to trigger delete webhook:', err.message)
        );
      }
      
      res.json({ message: 'Deleted successfully' });
    } catch (e) { next(e); }
  }
}
