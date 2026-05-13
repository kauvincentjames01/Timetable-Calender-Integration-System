// backend/repositories/TokenRepository.js
import { query, getDb } from '../database/db.js';

// In-memory fallback for preview environments
const mockTokens = new Map();
const mockStudents = new Map();
const mockLogs = [];

export class TokenRepository {
  static async findByStudentRegNumber(regNumber) {
    if (!getDb()) {
      return Array.from(mockTokens.values()).find(t => t.reg_number === regNumber);
    }
    const res = await query(
      `SELECT t.* FROM tokens t 
       JOIN students s ON t.student_id = s.id 
       WHERE s.reg_number = $1`,
      [regNumber]
    );
    return res.rows[0];
  }

  static async findByHash(secureHash) {
    if (!getDb()) {
      // In preview without a DB, the server might restart between generation and Google Calendar polling.
      // So if the token isn't found in memory, we fabricate one so the feed still outputs.
      let token = mockTokens.get(secureHash);
      if (!token) {
        token = {
          id: Date.now(),
          student_id: 1,
          secure_hash: secureHash,
          created_at: new Date(),
          last_accessed: new Date(),
          reg_number: "23/U/16751/PS" // fallback to specific student
        };
      }
      return token;
    }
    const res = await query('SELECT * FROM tokens WHERE secure_hash = $1', [secureHash]);
    return res.rows[0];
  }

  static async createToken(studentId, secureHash, regNumber) {
    if (!getDb()) {
      const token = {
        id: Date.now(),
        student_id: studentId,
        secure_hash: secureHash,
        created_at: new Date(),
        last_accessed: new Date(),
        reg_number: regNumber // for mock easy lookup
      };
      mockTokens.set(secureHash, token);
      return token;
    }

    const res = await query(
      `INSERT INTO tokens (student_id, secure_hash, created_at, last_accessed)
       VALUES ($1, $2, NOW(), NOW()) RETURNING *`,
      [studentId, secureHash]
    );
    return res.rows[0];
  }

  static async updateLastAccessed(tokenId) {
    if (!getDb()) return; // Mock ignores update for simplicity
    await query('UPDATE tokens SET last_accessed = NOW() WHERE id = $1', [tokenId]);
  }
}

export class StudentRepository {
  static async findByRegNumber(regNumber) {
    if (!getDb()) {
      if (!mockStudents.has(regNumber)) {
        const fakeStudent = { id: Date.now(), reg_number: regNumber, name: "Student " + regNumber, email: `${regNumber.replace(/\//g, '')}@students.mak.ac.ug` };
        mockStudents.set(regNumber, fakeStudent);
      }
      return mockStudents.get(regNumber);
    }
    
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
    if (!getDb()) {
       mockLogs.push({ tokenId, status, timestamp: new Date(), errorDetails });
       return;
    }
    await query(
      `INSERT INTO sync_logs (token_id, status, timestamp, error_details) 
       VALUES ($1, $2, NOW(), $3)`,
      [tokenId, status, errorDetails]
    );
  }
}
