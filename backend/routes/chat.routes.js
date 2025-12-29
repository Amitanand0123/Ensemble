import express from 'express'
import {protect} from '../middlewares/auth.js'
import { getPersonalMessages,getProjectMessages,getWorkspaceMessages,markMessagesAsread, uploadChatAttachment } from '../controllers/chatController.js'
import multer from 'multer';

const router=express.Router()
const upload = multer({ storage: multer.memoryStorage() });

router.use(protect)

router.post('/upload', upload.single('chatAttachment'), uploadChatAttachment);

router.get('/personal/:userId',getPersonalMessages)
router.get('/project/:projectId',getProjectMessages)
router.get('/workspace/:workspaceId',getWorkspaceMessages)
router.patch('/read/:chatId',markMessagesAsread)

export default router;