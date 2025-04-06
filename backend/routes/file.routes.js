// routes/file.routes.js
import express from 'express';
import { protect } from '../middlewares/auth.js';
import { deleteFile,summarizeFile } from '../controllers/fileController.js';

const router = express.Router();

// Apply auth middleware to all file routes here
router.use(protect);

// DELETE /api/files/:fileId
router.delete('/:fileId', deleteFile);
router.get('/:fileId/summary',summarizeFile)

export default router;