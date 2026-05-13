// backend/database/db.js
import { Pool } from 'pg';

let pool;

const initDbSchema = async (p) => {
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        student_number VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(100);

      CREATE TABLE IF NOT EXISTS timetable_events (
        id SERIAL PRIMARY KEY,
        course_code VARCHAR(50) NOT NULL,
        course_name VARCHAR(255) NOT NULL,
        lecturer VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        day_of_week INT NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        reg_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100)
      );

      CREATE TABLE IF NOT EXISTS tokens (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES students(id) ON DELETE CASCADE,
        secure_hash VARCHAR(64) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_token_hash ON tokens(secure_hash);

      CREATE TABLE IF NOT EXISTS sync_logs (
        id SERIAL PRIMARY KEY,
        token_id INT REFERENCES tokens(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        error_details TEXT
      );
    `);
    console.log('Database schema verified.');
  } catch (err) {
    console.error('Failed to initialize mock database schema', err);
  }
};

export const getDb = () => {
  if (!pool) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl || !dbUrl.startsWith('postgres') || dbUrl.includes('user:password@host')) {
      console.warn('Valid DATABASE_URL is not set. Using mock database fallback for development/preview purposes.');
      return null;
    }

    try {
      pool = new Pool({
        connectionString: dbUrl,
        // allow unauthorized for local development
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
      });

      // Initialize Schema
      initDbSchema(pool);
    } catch (e) {
      console.warn('Failed to initialize PostgreSQL pool. Falling back to mock database.', e.message);
      return null;
    }
  }
  return pool;
};

// Quick helper for queries
export const query = async (text, params) => {
  const p = getDb();
  if (p) {
    return p.query(text, params);
  }
  throw new Error("Database not connected");
};

