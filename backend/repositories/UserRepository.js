import { query, getDb } from '../database/db.js';

// In-memory fallback for preview environments
const mockUsers = new Map();

export class UserRepository {
  static async findByStudentNumber(studentNumber) {
    if (!getDb()) {
      return mockUsers.get(studentNumber) || null;
    }
    
    try {
      const res = await query('SELECT * FROM users WHERE student_number = $1', [studentNumber]);
      return res.rows[0] || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async createUser(studentNumber, passwordHash, role, name = null) {
    if (!getDb()) {
      const user = {
        id: Date.now(),
        name: name,
        student_number: studentNumber,
        password_hash: passwordHash,
        role: role,
        created_at: new Date()
      };
      mockUsers.set(studentNumber, user);
      return user;
    }

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
