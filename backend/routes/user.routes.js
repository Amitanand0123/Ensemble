// --- START OF FILE backend/routes/user.routes.js ---

import express from 'express';
import { protect } from '../middlewares/auth.js';
import { adminProtect } from '../middlewares/adminAuth.js';
import {
    getAllUsers,
    updateUserRole,
    getUserProfile, // Import new controller
    updateMyAvatar  // Import new controller
} from '../controllers/userController.js';
import multer from 'multer'; // Import multer

const router=express.Router()

// Configure Multer for memory storage (suitable for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit example
});


// --- Admin Routes ---
router.get('/', protect, adminProtect, getAllUsers);
router.patch('/:userId/role', protect, adminProtect, updateUserRole); // Keep PATCH for consistency

// --- User Profile Routes ---
// Route for logged-in user's own profile (specific endpoint)
// Already implicitly handled by /api/auth/me, but this could be an alternative if needed
// router.get('/me', protect, getMyProfile); // Assumes getMyProfile controller exists

// Route for fetching any user's profile by ID
router.get('/:userId', protect, getUserProfile); // Protect to ensure only logged-in users can view profiles

// Route for logged-in user to update their own avatar
router.patch('/me/avatar', protect, upload.single('avatar'), updateMyAvatar); // Use protect & multer

export default router;
// --- END OF FILE backend/routes/user.routes.js ---