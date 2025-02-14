import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';


// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


//import routes
import authRoutes from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import callRoutes from './routes/callRoutes.js';
import audioRoutes from "./routes/audioRoutes.js";


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes); // 🔐 Protected Routes
app.use('/api/projects', projectRoutes);
app.use('/api/assistants', assistantRoutes);
app.use('/api/calls', callRoutes);
app.use("/api/audio", audioRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
