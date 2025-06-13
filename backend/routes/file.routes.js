
import express from 'express';
import { protect } from '../middlewares/auth.js';
import { deleteFile,summarizeFile } from '../controllers/fileController.js';

const router = express.Router();


router.use(protect);


router.delete('/:fileId', deleteFile);
router.get('/:fileId/summary',summarizeFile)

export default router;