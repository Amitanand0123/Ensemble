import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middlewares/errorHandler.js';
import workspaceRoutes from './routes/workspace.routes.js'
import { set } from 'mongoose';
import projectRoutes from './routes/project.routes.js';
import tasksRoutes from './routes/task.routes.js';
import {setupSocketIO} from './socket.js';


dotenv.config();

const app = express();

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);

app.use('/api/projects',projectRoutes)
app.use('/api/tasks',tasksRoutes)

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const io=setupSocketIO(app)