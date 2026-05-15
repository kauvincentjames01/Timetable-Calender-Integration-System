import { query } from '../database/db.js';

export class WebhookRepository {
  static async create(webhook) {
    const { token_id, calendar_id, google_access_token, google_refresh_token, webhook_url } = webhook;
    const res = await query(
      `INSERT INTO webhooks (token_id, calendar_id, google_access_token, google_refresh_token, webhook_url) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [token_id, calendar_id, google_access_token, google_refresh_token, webhook_url]
    );
    return res.rows[0];
  }

  static async findByTokenId(token_id) {
    const res = await query('SELECT * FROM webhooks WHERE token_id = $1 AND is_active = true', [token_id]);
    return res.rows;
  }

  static async findById(webhook_id) {
    const res = await query('SELECT * FROM webhooks WHERE id = $1', [webhook_id]);
    return res.rows[0];
  }

  static async findAll() {
    const res = await query('SELECT * FROM webhooks WHERE is_active = true');
    return res.rows;
  }

  static async updateLastTriggered(webhook_id) {
    const res = await query(
      'UPDATE webhooks SET last_triggered = NOW() WHERE id = $1 RETURNING *',
      [webhook_id]
    );
    return res.rows[0];
  }

  static async deactivate(webhook_id) {
    const res = await query(
      'UPDATE webhooks SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [webhook_id]
    );
    return res.rows[0];
  }

  static async update(webhook_id, updates) {
    const { google_access_token, google_refresh_token } = updates;
    const res = await query(
      `UPDATE webhooks SET google_access_token = COALESCE($1, google_access_token),
                          google_refresh_token = COALESCE($2, google_refresh_token),
                          updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [google_access_token, google_refresh_token, webhook_id]
    );
    return res.rows[0];
  }
}
