import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import errorHandler from './middlewares/errorHandler.js';
import workspaceRoutes from './routes/workspace.routes.js';
import chatbotRoutes from './routes/chatbot.routes.js';
import userRoutes from './routes/user.routes.js';
import fileRoutes from './routes/file.routes.js';
import projectRoutes from './routes/project.routes.js';
import tasksRoutes from './routes/task.routes.js';
import paymentRoutes from './routes/payment.routes.js'
import { setupSocketIO } from './utils/socket.js';
import http from 'http';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import './config/passport-config.js';



const app = express();

// Trust proxy in production (required for secure cookies behind Render/Vercel reverse proxy)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5175',
    'http://localhost',
    'http://localhost:80',
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
} 

const corsOptions={
    origin:function(origin,callback){
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error("CORS Check - Denied:", origin);
            console.log("Allowed Origins:", allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials:true,
    methods:['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
    allowedHeaders:['Content-Type','Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders:['Set-Cookie']
}


app.use(cors(corsOptions));
connectDB();
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}))
app.use(passport.initialize())
app.use(passport.session())


// Health check endpoint (no auth required - used by Render, Docker, etc.)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users',userRoutes)
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/chatbot',chatbotRoutes)
app.use('/api/files',fileRoutes)
app.use('/api/payments',paymentRoutes)

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

setupSocketIO(server, allowedOrigins);

server.listen(PORT,'0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    if(!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET){
        console.warn("Reminder:Razorpay API keys are missing or seemse like it is not loaded from .env")
    }
});