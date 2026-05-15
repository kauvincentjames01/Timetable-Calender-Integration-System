// backend/repositories/Repositories.js
import { query } from '../database/db.js';

export class TokenRepository {
  static async findByStudentRegNumber(regNumber) {
    const res = await query(
      `SELECT t.* FROM tokens t 
       JOIN students s ON t.student_id = s.id 
       WHERE s.reg_number = $1`,
      [regNumber]
    );
    return res.rows[0];
  }

  static async findByHash(secureHash) {
    const res = await query('SELECT * FROM tokens WHERE secure_hash = $1', [secureHash]);
    return res.rows[0];
  }

  static async createToken(studentId, secureHash, regNumber) {
    const res = await query(
      `INSERT INTO tokens (student_id, secure_hash, created_at, last_accessed)
       VALUES ($1, $2, NOW(), NOW()) RETURNING *`,
      [studentId, secureHash]
    );
    return res.rows[0];
  }

  static async updateLastAccessed(tokenId) {
    await query('UPDATE tokens SET last_accessed = NOW() WHERE id = $1', [tokenId]);
  }
}

export class StudentRepository {
  static async findByRegNumber(regNumber) {
    const res = await query('SELECT * FROM students WHERE reg_number = $1', [regNumber]);
    if (res.rows.length === 0) {
       // Insert if not exists for demo purposes
       const inserted = await query(
         'INSERT INTO students (reg_number, name, email) VALUES ($1, $2, $3) RETURNING *',
         [regNumber, "Demo Student", `${regNumber.replace(/\//g,'')}@mak.ac.ug`]
       );
       return inserted.rows[0];
    }
    return res.rows[0];
  }
}

export class SyncLogRepository {
  static async createLog(tokenId, status, errorDetails = null) {
    await query(
      `INSERT INTO sync_logs (token_id, status, timestamp, error_details) 
       VALUES ($1, $2, NOW(), $3)`,
      [tokenId, status, errorDetails]
    );
  }
}
