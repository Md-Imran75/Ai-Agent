import express from "express";
import { startAudioCapture } from "../controllers/audioController.js";

const router = express.Router();

// Route to start audio capture
router.post("/start", startAudioCapture);



export default router;
