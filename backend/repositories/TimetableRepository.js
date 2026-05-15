import { query, getDb } from '../database/db.js';

const initialMockTimetable = [
  { course_code: "BSE 3201", course_name: "System Integration & Deployment", lecturer: "Dr. Richard Ssekibuule", location: "Block A - Room 102", day_of_week: 0, start_time: "09:00", end_time: "11:00" },
  { course_code: "BIT 3208", course_name: "IT Project Management", lecturer: "Dr. Evelyn Kigozi", location: "CIT Lab 2", day_of_week: 0, start_time: "14:00", end_time: "17:00" },
  { course_code: "CSC 3201", course_name: "Computer Networks II", lecturer: "Prof. Engineer", location: "CIT Lab 4", day_of_week: 1, start_time: "10:00", end_time: "13:00" },
  { course_code: "IST 3204", course_name: "Information Systems Security", lecturer: "Mr. Paul Birevu", location: "Block B - Room 10", day_of_week: 2, start_time: "09:00", end_time: "12:00" },
  { course_code: "IST 3205", course_name: "Data Warehousing and Mining", lecturer: "Dr. Agnes Nakakawa", location: "CIT Lab 3", day_of_week: 3, start_time: "15:00", end_time: "17:00" },
  { course_code: "BKE 3201", course_name: "Entrepreneurship Skills", lecturer: "Mrs. Sarah Nanyonga", location: "FEMA Big Lab", day_of_week: 4, start_time: "11:00", end_time: "13:00" }
];

export class TimetableRepository {
  static async getAll() {
    try {
      const res = await query('SELECT * FROM timetable_events ORDER BY day_of_week ASC, start_time ASC');
      
      // Auto-seed if database is empty so you aren't staring at a blank page
      if (res.rows.length === 0) {
        for (const ev of initialMockTimetable) {
          await this.create(ev);
        }
        const seeded = await query('SELECT * FROM timetable_events ORDER BY day_of_week ASC, start_time ASC');
        return seeded.rows;
      }

      return res.rows;
    } catch (e) {
      console.error('Error fetching timetable from database:', e);
      throw e;
    }
  }

  static async create(data) {
    const res = await query(
      `INSERT INTO timetable_events (course_code, course_name, lecturer, location, day_of_week, start_time, end_time) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.course_code, data.course_name, data.lecturer, data.location, data.day_of_week, data.start_time, data.end_time]
    );
    return res.rows[0];
  }

  static async update(id, data) {
    const res = await query(
      `UPDATE timetable_events SET 
       course_code=$1, course_name=$2, lecturer=$3, location=$4, day_of_week=$5, start_time=$6, end_time=$7 
       WHERE id=$8 RETURNING *`,
      [data.course_code, data.course_name, data.lecturer, data.location, data.day_of_week, data.start_time, data.end_time, id]
    );
    return res.rows[0];
  }

  static async delete(id) {
    await query('DELETE FROM timetable_events WHERE id=$1', [id]);
    return { success: true };
  }

  static async getById(id) {
    const res = await query('SELECT * FROM timetable_events WHERE id=$1', [id]);
    return res.rows[0];
  }
}
