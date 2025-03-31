import express from 'express';
import { protect } from '../middlewares/auth.js';
import {generateResponse} from '../controllers/chatbotController.js';

const router = express.Router();

router.post('/generate', protect, generateResponse);

export default router;
