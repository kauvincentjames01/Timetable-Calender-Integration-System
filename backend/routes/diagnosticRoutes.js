import express from 'express';
import { DiagnosticController } from '../controllers/DiagnosticController.js';

const router = express.Router();

// Diagnostic endpoints (no authentication required for setup)
router.get('/webhook-status', DiagnosticController.checkWebhookStatus);
router.get('/oauth-setup', DiagnosticController.getOAuthSetupUrl);
router.post('/test-google-connection', DiagnosticController.testGoogleCalendarConnection);

export default router;
