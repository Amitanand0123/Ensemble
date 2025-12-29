import User from '../models/User.js';
import mongoose from 'mongoose';
import { uploadToCloud, deleteFromCloud } from '../utils/fileUpload.js'; 

export const getAllUsers = async (req, res) => { 
    try {
        const users = await User.find({}).select('-password -security -email_verification.token -activity.loginHistory');
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
        userToUpdate.role = newRole;
        await userToUpdate.save({ validateBeforeSave: true });
        const updatedUserResponse = await User.findById(userId).select('-password -security -email_verification.token -activity.loginHistory');
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

export const getUserProfile = async (req, res) => {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid user ID format' 
        });
    }
    try {
        const userProfile = await User.findById(userId)
            .select('-password -security -email_verification.token -activity.loginHistory -notifications._id') 
            .populate({ 
                path: 'workspaces.workspace',
                select: 'name settings.isPrivate _id', 
                match: { status: 'active' } 
            });

        if (!userProfile) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            user: userProfile
        });

    } catch (error) {
        console.error(`Error fetching profile for user ${userId}:`, error);
        res.status(500).json({ success: false, message: 'Server error fetching user profile' });
    }
};


export const updateMyAvatar = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: 'No avatar image uploaded.' 
        });
    }
    try {
        const user = await User.findById(req.user._id); 
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found.' 
            });
        }
        if (user.avatar?.public_id && user.avatar.url !== 'default-avatar.png') {
            try {
                await deleteFromCloud(user.avatar.public_id);  
            } catch (deleteError) {
                console.warn(`Could not delete old avatar (${user.avatar.public_id}):`, deleteError.message);
            }
        }
        const result = await uploadToCloud(
            req.file.buffer,
            `avatar_${user._id}_${Date.now()}`, 
            `user_avatars/${user._id}`
        );
        user.avatar = {
            url: result.url,
            public_id: result.public_id, 
            uploadDate: new Date()
        };
        await user.save();
        res.json({
            success: true,
            message: 'Avatar updated successfully.',
            avatar: user.avatar 
        });

    } catch (error) {
        console.error('Error updating avatar:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File size exceeds the 5MB limit.' });
        }
        res.status(500).json({ success: false, message: 'Server error updating avatar.' });
    }
};

export const getMyAvatarUrl = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('avatar.url'); 
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            avatarUrl: user.avatar?.url || 'default-avatar.png' 
        });
    } catch (error) {
        console.error('Error fetching avatar URL:', error);
        res.status(500).json({ success: false, message: 'Server error fetching avatar URL' });
    }
};
