import express from 'express';
import { protect } from '../middlewares/auth.js';
import { adminProtect } from '../middlewares/adminAuth.js';
import {
    getAllUsers,
    updateUserRole,
    getUserProfile, 
    updateMyAvatar,  
    getMyAvatarUrl
} from '../controllers/userController.js';
import multer from 'multer'; 

const router=express.Router()
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

router.get('/', protect, adminProtect, getAllUsers);
router.patch('/:userId/role', protect, adminProtect, updateUserRole); 
router.get('/me/avatar-url', protect, getMyAvatarUrl);
router.get('/:userId', protect, getUserProfile); 
router.patch('/me/avatar', protect, upload.single('avatar'), updateMyAvatar); 

export default router;
