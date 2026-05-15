import { query } from '../database/db.js';

export class UserRepository {
  static async findByStudentNumber(studentNumber) {
    try {
      const res = await query('SELECT * FROM users WHERE student_number = $1', [studentNumber]);
      return res.rows[0] || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async createUser(studentNumber, passwordHash, role, name = null) {
    try {
      const res = await query(
        'INSERT INTO users (name, student_number, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, student_number, role, created_at',
        [name, studentNumber, passwordHash, role]
      );
      return res.rows[0];
    } catch (e) {
      console.error(e);
      throw new Error('Database error creating user');
    }
  }
}
