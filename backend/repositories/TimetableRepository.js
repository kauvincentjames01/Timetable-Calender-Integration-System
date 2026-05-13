import { query, getDb } from '../database/db.js';

let mockTimetable = [
  { id: 1, course_code: "BSE 3201", course_name: "System Integration & Deployment", lecturer: "Dr. Richard Ssekibuule", location: "Block A - Room 102", day_of_week: 0, start_time: "09:00", end_time: "11:00" },
  { id: 2, course_code: "BIT 3208", course_name: "IT Project Management", lecturer: "Dr. Evelyn Kigozi", location: "CIT Lab 2", day_of_week: 0, start_time: "14:00", end_time: "17:00" },
  { id: 3, course_code: "CSC 3201", course_name: "Computer Networks II", lecturer: "Prof. Engineer", location: "CIT Lab 4", day_of_week: 1, start_time: "10:00", end_time: "13:00" },
  { id: 4, course_code: "IST 3204", course_name: "Information Systems Security", lecturer: "Mr. Paul Birevu", location: "Block B - Room 10", day_of_week: 2, start_time: "09:00", end_time: "12:00" },
  { id: 5, course_code: "IST 3205", course_name: "Data Warehousing and Mining", lecturer: "Dr. Agnes Nakakawa", location: "CIT Lab 3", day_of_week: 3, start_time: "15:00", end_time: "17:00" },
  { id: 6, course_code: "BKE 3201", course_name: "Entrepreneurship Skills", lecturer: "Mrs. Sarah Nanyonga", location: "FEMA Big Lab", day_of_week: 4, start_time: "11:00", end_time: "13:00" }
];

let nextId = 7;

export class TimetableRepository {
  static async getAll() {
    if (!getDb()) {
      return [...mockTimetable];
    }
    try {
      const res = await query('SELECT * FROM timetable_events ORDER BY day_of_week ASC, start_time ASC');
      if (res.rows.length === 0) {
        // Seed database if empty for presentation
        for (const ev of mockTimetable) {
          await this.create(ev);
        }
        const seeded = await query('SELECT * FROM timetable_events ORDER BY day_of_week ASC, start_time ASC');
        return seeded.rows;
      }
      return res.rows;
    } catch (e) {
      console.error(e);
      return [...mockTimetable];
    }
  }

  static async create(data) {
    if (!getDb()) {
      const newEvent = { ...data, id: nextId++ };
      mockTimetable.push(newEvent);
      return newEvent;
    }
    const res = await query(
      `INSERT INTO timetable_events (course_code, course_name, lecturer, location, day_of_week, start_time, end_time) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.course_code, data.course_name, data.lecturer, data.location, data.day_of_week, data.start_time, data.end_time]
    );
    return res.rows[0];
  }

  static async update(id, data) {
    if (!getDb()) {
      const index = mockTimetable.findIndex(e => e.id === parseInt(id));
      if (index === -1) return null;
      mockTimetable[index] = { ...mockTimetable[index], ...data };
      return mockTimetable[index];
    }
    const res = await query(
      `UPDATE timetable_events SET 
       course_code=$1, course_name=$2, lecturer=$3, location=$4, day_of_week=$5, start_time=$6, end_time=$7 
       WHERE id=$8 RETURNING *`,
      [data.course_code, data.course_name, data.lecturer, data.location, data.day_of_week, data.start_time, data.end_time, id]
    );
    return res.rows[0];
  }

  static async delete(id) {
    if (!getDb()) {
      mockTimetable = mockTimetable.filter(e => e.id !== parseInt(id));
      return { success: true };
    }
    await query('DELETE FROM timetable_events WHERE id=$1', [id]);
    return { success: true };
  }
}
