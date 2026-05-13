import express from 'express';
import { AdminTimetableController } from '../controllers/AdminTimetableController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth limits to all routes in this file
router.use(requireAuth, requireAdmin);

router.get('/timetable', AdminTimetableController.getEvents);
router.post('/timetable', AdminTimetableController.createEvent);
router.put('/timetable/:id', AdminTimetableController.updateEvent);
router.delete('/timetable/:id', AdminTimetableController.deleteEvent);

export default router;
