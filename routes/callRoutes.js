import express from 'express';
import { makeCall } from '../controllers/callController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/call', authMiddleware, makeCall);

export default router;
