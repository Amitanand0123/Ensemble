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

const devFrontendUrl = 'http://localhost:5173';
const prodFrontendUrl = process.env.FRONTEND_URL;

const allowedOrigins = [devFrontendUrl];
if (prodFrontendUrl) {
    allowedOrigins.push(prodFrontendUrl);
} 

const corsOptions={
    origin:function(origin,callback){ //  function used to dynamically check if a request's origin is allowed.
        if (!origin) return callback(null, true); //  If the request has no origin (like from curl or same-origin). Allow the request (no error, access granted).
        if (allowedOrigins.indexOf(origin) !== -1) { // Checks if origin exists in allowedOrigins.
            callback(null, true); // Calls the callback with null (no error) and true (access allowed).
        } else {
            console.error("CORS Check - Denied:", origin);
            console.log("Allowed Origins:", allowedOrigins);
            callback(new Error('Not allowed by CORS')); // Rejects the request by passing an error to the callback.
        }
    },
    credentials:true, // Allows cookies and credentials (like Authorization headers) to be sent in cross-origin requests.
    methods:['GET','POST','PUT','DELETE','PATCH','OPTIONS'], //Lists the allowed HTTP methods for cross-origin requests.
    allowedHeaders:['Content-Type','Authorization'] // Lists the HTTP headers allowed in requests from the frontend.
}


app.use(cors(corsOptions)); // app.use: Adds middleware to your Express app. This controls which frontend origins are allowed to communicate with your server and under what conditions (headers, methods, credentials, etc.).
connectDB();
app.use(express.json());
app.use(express.urlencoded({extended:true})) // Adds middleware to parse URL-encoded form data (like from HTML <form> submissions). extended: true allows parsing of rich data structures like nested objects.

app.use(session({ // Adds session middleware to your app.
    secret: process.env.SESSION_SECRET, // Used to sign the session ID cookie.
    resave: false,  // Tells the session middleware not to save the session back to the store if nothing has changed.
    saveUninitialized: false, // If set to false, sessions are not saved to the store unless they are modified (e.g., after a user logs in).
    store: MongoStore.create({ // Uses connect-mongo to store session data in MongoDB instead of in-memory
        mongoUrl: process.env.MONGO_URI // MongoDB connection string (from .env file).
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // If true, cookies are only sent over HTTPS.
        httpOnly: true, // Prevents JavaScript from accessing the session cookie (protects against XSS attacks).
        sameSite: 'None', // Allows cookies to be sent across different origins (useful when your frontend and backend are on different domains).
        maxAge: 24 * 60 * 60 * 1000
    }
}))
app.use(passport.initialize()) // Initializes Passport.js, a popular middleware for authentication (like Google OAuth, local login, etc.).Must be called before any route that uses Passport.
app.use(passport.session()) // Enables persistent login sessions using the session middleware.This connects Passport with express-session, so logged-in users remain authenticated across requests.


//Each line mounts a specific set of routes under a base path:
app.use('/api/auth', authRoutes);
app.use('/api/users',userRoutes)
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/chatbot',chatbotRoutes)
app.use('/api/files',fileRoutes)
app.use('/api/payments',paymentRoutes)

// Error handler
app.use(errorHandler); // Typically catches and formats errors thrown in async route handlers.

const PORT = process.env.PORT || 5000;

const server = http.createServer(app); // Creates a raw HTTP server to be able to attach WebSockets (used for real-time communication).

setupSocketIO(server); // Initializes Socket.IO or other real-time systems by attaching to the raw server instance.

server.listen(PORT,'0.0.0.0', () => { // Starts the server on all available network interfaces (public + localhost).
    console.log(`Server running on port ${PORT}`);
    if(!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET){
        console.warn("Reminder:Razorpay API keys are missing or seemse like it is not loaded from .env")
    }
});