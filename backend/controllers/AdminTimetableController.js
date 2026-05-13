import { TimetableRepository } from '../repositories/TimetableRepository.js';

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
      res.status(201).json(newEvent);
    } catch (e) { next(e); }
  }

  static async updateEvent(req, res, next) {
    try {
      const updatedEvent = await TimetableRepository.update(req.params.id, req.body);
      if (!updatedEvent) return res.status(404).json({ error: 'Event not found' });
      res.json(updatedEvent);
    } catch (e) { next(e); }
  }

  static async deleteEvent(req, res, next) {
    try {
      await TimetableRepository.delete(req.params.id);
      res.json({ message: 'Deleted successfully' });
    } catch (e) { next(e); }
  }
}
