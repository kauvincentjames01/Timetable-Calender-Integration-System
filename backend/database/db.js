// backend/database/db.js
import 'dotenv/config';
import { Pool } from 'pg';

let pool;

const initDbSchema = async (client) => {
  try {
    await client.query(`
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

      CREATE TABLE IF NOT EXISTS webhooks (
        id SERIAL PRIMARY KEY,
        token_id INT REFERENCES tokens(id) ON DELETE CASCADE,
        calendar_id VARCHAR(255),
        google_access_token TEXT,
        google_refresh_token TEXT,
        webhook_url VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        last_triggered TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_webhook_token_id ON webhooks(token_id);
      CREATE INDEX IF NOT EXISTS idx_webhook_active ON webhooks(is_active);
    `);
    console.log('Database schema verified.');
  } catch (err) {
    console.error('Failed to initialize database schema', err);
    throw err;
  }
};

const createPool = () => {
  const dbUrl = process.env.DATABASE_URL?.trim();

  if (!dbUrl || (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://'))) {
    console.warn('Valid DATABASE_URL is not set. Using mock database fallback for development/preview purposes.');
    return null;
  }

  try {
    const sslConfig = !/(localhost|127\.0\.0\.1)/.test(dbUrl)
      ? { rejectUnauthorized: false }
      : false;

    const newPool = new Pool({
      connectionString: dbUrl,
      ssl: sslConfig,
    });

    newPool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });

    return newPool;
  } catch (err) {
    console.warn('Failed to create PostgreSQL pool.', err.message);
    return null;
  }
};

export const getDb = () => {
  if (!pool) {
    pool = createPool();
  }
  return pool;
};

export const initDb = async () => {
  const db = getDb();
  if (!db) {
    throw new Error('DATABASE_URL is not configured or invalid. Set DATABASE_URL to a valid PostgreSQL connection string.');
  }
  await initDbSchema(db);
  return db;
};

export const query = async (text, params) => {
  const db = getDb();
  if (db) {
    return db.query(text, params);
  }
  throw new Error('Database not connected. Please configure DATABASE_URL.');
};

