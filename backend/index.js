import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import errorHandler from './middlewares/errorHandler.js';
import workspaceRoutes from './routes/workspace.routes.js';
import { set } from 'mongoose';
import projectRoutes from './routes/project.routes.js';
import tasksRoutes from './routes/task.routes.js';
import { setupSocketIO } from './utils/socket.js';
import http from 'http'; // ✅ Import the HTTP module

dotenv.config();

const app = express();

const allowedOrigins=[process.env.FRONTEND_URL || 'http://localhost:5173'];
const corsOptions={
    origin:function(origin,callback){
        if(!origin || allowedOrigins.indexOf(origin)!==-1){
            callback(null,true)
        }
        else{
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials:true,
    methods:['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
    allowedHeaders:['Content-Type','Authorization']
}


app.use(cors(corsOptions));
connectDB();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/chat/',chatRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = setupSocketIO(server);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
