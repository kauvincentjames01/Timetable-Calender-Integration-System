import { query, getDb } from '../database/db.js';

export class TimetableRepository {
  static async getAll() {
    try {
      const res = await query('SELECT * FROM timetable_events ORDER BY day_of_week ASC, start_time ASC');
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
}
