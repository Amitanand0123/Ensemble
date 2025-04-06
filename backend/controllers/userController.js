import User from '../models/User.js'
import mongoose from 'mongoose'

export const getAllUsers=async(requestAnimationFrame,res)=>{
    try {
        const users=await User.find({}).select('-password -security -activity.loginHistory')
        res.json({
            success:true,
            count:users.length,
            users
        })
    } catch (error) {
        console.error('Error fetching users:',error)
        res.status(500).json({
            success:false,
            message:'Server error while fetching users'
        })
    }
}

export const updateUserRole=async(req,res)=>{
    const {userId}=req.params;
    const {role:newRole}=req.body;
    if(!mongoose.Types.ObjectId.isValid(userId)){
        return res.status(400).json({
            success:false,
            message:'Invalid user ID format'
        })
    }
    const allowedRoles=['user','admin','moderator']
    if(!newRole || !allowedRoles.includes(newRole)){
        return res.status(400).json({
            success:false,
            message:'Invalid role'
        })
    }
    try {
        const userToUpdate=await User.findById(userId);
        if(!userToUpdate){
            return res.status(404).json({
                success:false,
                message:'User not found'
            })
        }
        userToUpdate.role=newRole;
        await userToUpdate.save({validateBeforeSave:true});
        const updatedUserResponse=await User.findById(userId).select('-password -security -activity.loginHistory')
        res.json({
            success:true,
            message:`User role updated successfully to ${newRole} `,
            user:updatedUserResponse
        })
    } catch (error) {
        console.error('Error updating user role:',error)
        if(error.name==='ValidationError'){
            return res.status(400).json({
                success:false,
                message:error.message
            })
        }
        res.status(500).json({
            success:false,
            message:'Server error while updating user role.'
        })
    }
}