// --- START OF FILE backend/controllers/userController.js ---

// backend/controllers/userController.js
import User from '../models/User.js';
import mongoose from 'mongoose';
import { uploadToCloud, deleteFromCloud } from '../utils/fileUpload.js'; // Import Cloudinary functions

export const getAllUsers = async (req, res) => { // Changed first param name
    try {
        // Exclude sensitive fields
        const users = await User.find({})
                                .select('-password -security -email_verification.token -activity.loginHistory');
        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
};

export const updateUserRole = async (req, res) => {
    const { userId } = req.params;
    const { role: newRole } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid user ID format'
        });
    }

    const allowedRoles = ['user', 'admin', 'moderator'];
    if (!newRole || !allowedRoles.includes(newRole)) {
        return res.status(400).json({
            success: false,
            message: `Invalid role specified. Allowed roles are: ${allowedRoles.join(', ')}`
        });
    }

    // Prevent admin from changing their own role via this endpoint (safety)
    if (req.user.id === userId) {
        return res.status(400).json({ success: false, message: "Admins cannot change their own role here." });
    }

    try {
        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Optional: Prevent demoting the last admin? (More complex logic needed)

        userToUpdate.role = newRole;
        await userToUpdate.save({ validateBeforeSave: true });

        // Return the updated user, excluding sensitive info
        const updatedUserResponse = await User.findById(userId)
                                            .select('-password -security -email_verification.token -activity.loginHistory');

        res.json({
            success: true,
            message: `User role updated successfully to ${newRole}`,
            user: updatedUserResponse
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while updating user role.'
        });
    }
};

// --- Get User Profile ---
export const getUserProfile = async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    try {
        // Select fields to EXCLUDE
        const userProfile = await User.findById(userId)
            .select('-password -security -email_verification.token -activity.loginHistory -notifications._id') // Exclude sensitive/internal fields
            .populate({ // Populate workspaces the user is part of
                path: 'workspaces.workspace',
                select: 'name settings.isPrivate _id', // Select only needed workspace fields
                match: { status: 'active' } // Only active workspaces
            });

        if (!userProfile) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Filter workspaces based on privacy (example: show only public ones or ones the requester is also in)
        // For simplicity now, we'll return all populated ones. Add filtering later if needed.
        // userProfile.workspaces = userProfile.workspaces.filter(w => w.workspace && !w.workspace.settings.isPrivate); // Example: only public

        res.json({
            success: true,
            user: userProfile
        });

    } catch (error) {
        console.error(`Error fetching profile for user ${userId}:`, error);
        res.status(500).json({ success: false, message: 'Server error fetching user profile' });
    }
};

// --- Update Logged-in User's Avatar ---
export const updateMyAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No avatar image uploaded.' });
    }

    try {
        const user = await User.findById(req.user._id); // Get the logged-in user document
        if (!user) {
            // Should not happen if protect middleware works
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Optional: Delete old avatar from Cloudinary if it exists and isn't the default
        if (user.avatar?.public_id && user.avatar.url !== 'default-avatar.png') {
            try {
                await deleteFromCloud(user.avatar.public_id);
                console.log(`Deleted old avatar: ${user.avatar.public_id}`);
            } catch (deleteError) {
                // Log error but continue, maybe the old file was already deleted
                console.warn(`Could not delete old avatar (${user.avatar.public_id}):`, deleteError.message);
            }
        }

        // Upload new avatar to Cloudinary
        const result = await uploadToCloud(
            req.file.buffer,
            `avatar_${user._id}_${Date.now()}`, // Generate a unique filename
            `user_avatars/${user._id}` // Store in a user-specific folder
        );

        // Update user document
        user.avatar = {
            url: result.url,
            public_id: result.public_id, // Store public_id for future deletion
            uploadDate: new Date()
        };
        await user.save();

        // Return success response with new avatar URL
        res.json({
            success: true,
            message: 'Avatar updated successfully.',
            avatar: user.avatar // Send back the updated avatar object
        });

    } catch (error) {
        console.error('Error updating avatar:', error);
        // Handle specific errors like file size limit from multer if needed
        if (error.code === 'LIMIT_FILE_SIZE') {
             return res.status(400).json({ success: false, message: 'File size exceeds the 5MB limit.' });
        }
        res.status(500).json({ success: false, message: 'Server error updating avatar.' });
    }
};
// --- END OF FILE backend/controllers/userController.js ---