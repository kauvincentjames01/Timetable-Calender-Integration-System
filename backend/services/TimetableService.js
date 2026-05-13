// Mocking integration with external Makerere Timetable Management System
import { TimetableRepository } from '../repositories/TimetableRepository.js';

export class TimetableService {
  static async fetchTimetable(regNumber) {
    // Generate mock schedule dynamically anchored to the current week
    const now = new Date();
    // Get the Monday of the current week as the baseline
    const monday = new Date(now);
    const day = now.getDay() || 7; // Convert Sunday from 0 to 7
    monday.setDate(now.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);

    const getDayTime = (daysFromMonday, timeString) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + daysFromMonday);
      const [hours, minutes] = timeString.split(':').map(Number);
      d.setHours(hours, minutes, 0);
      return d.toISOString();
    };

    const events = await TimetableRepository.getAll();

    return events.map(ev => ({
      course_code: ev.course_code,
      course_name: ev.course_name,
      lecturer: ev.lecturer,
      location: ev.location,
      start_time: getDayTime(ev.day_of_week, ev.start_time),
      end_time: getDayTime(ev.day_of_week, ev.end_time)
    }));
  }
}


