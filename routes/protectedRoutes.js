import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/private-data', authMiddleware, (req, res) => {
    res.json({ message: 'You have accessed protected data!', user: req.user });
});

export default router;
