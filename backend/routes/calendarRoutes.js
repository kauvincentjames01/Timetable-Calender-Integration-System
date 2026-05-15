import express from 'express';
import { CalendarController } from '../controllers/CalendarController.js';

const router = express.Router();

router.post('/subscribe', CalendarController.handleSubscription);
router.get('/calendar/oauth-url', CalendarController.getOAuthUrl);
router.get('/calendar/oauth-callback', CalendarController.handleOAuthCallback);
router.post('/calendar/register-webhook', CalendarController.registerWebhook);
router.get('/feed/:token', CalendarController.serveFeed);

export default router;
