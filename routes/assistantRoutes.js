import express from 'express';
import { createAssistant, getAssistants } from '../controllers/assistantController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleware, createAssistant);
router.get('/list', authMiddleware, getAssistants);

export default router;
