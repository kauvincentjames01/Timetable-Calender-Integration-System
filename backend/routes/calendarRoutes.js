import express from 'express';
import { CalendarController } from '../controllers/CalendarController.js';

const router = express.Router();

router.post('/subscribe', CalendarController.handleSubscription);
router.get('/feed/:token', CalendarController.serveFeed);

export default router;
