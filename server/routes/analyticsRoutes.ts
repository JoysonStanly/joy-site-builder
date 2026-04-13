import express from 'express';
import { protect } from '../middlewares/auth.js';
import { trackActivity, getAnalyticsSummary } from '../controllers/analyticsController.js';

const analyticsRouter = express.Router();

analyticsRouter.post('/track', trackActivity);
analyticsRouter.get('/summary/:projectId', protect, getAnalyticsSummary);

export default analyticsRouter;