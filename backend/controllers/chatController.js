import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Workspace from "../models/Workspace.js";

export const getPersonalMessages=async(req,res)=>{
    try {
        const {userId}=req.params;
        const currUserId=req.user._id;
        const messages=await Chat.find({
            type:'personal',
            $or:[
                {sender:currUserId,receiver:userId},
                {sender:userId,receiver:currUserId}
            ]
        })
        .populate('sender','name avatar')
        .populate('receiver','name avatar')
        .sort({createdAt:1}) //sorts the retrived messages in ascending order // for descending cratedAt:-1

        res.json({
            success:true,
            messages
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:'Could not fetch messages',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    } 
}

export const getProjectMessages=async(req,res)=>{
    try {
        const {projectId}=req.params
        const project=await Project.findById(projectId)
        if(!project || !project.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to view project messages'
            })
        }

        const messages=await Chat.find({
            type:'project',
            project:projectId
        })
        .populate('sender','name avatar')
        .sort({createdAt:1})

        res.json({
            success:true,
            messages
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:'Could not fetch project messages',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

export const getWorkspaceMessages=async(req,res)=>{
    try{
        const {workspaceId}=req.params;
        const workspace=await Workspace.findById(workspaceId);
        if(!workspace || !workspace.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to view workspace messages'
            })
        }
        const messages=await Chat.find({
            type:'workspace',
            workspace:workspaceId
        })
        .populate('sender','name avatar')
        .sort({createdAt:1})

        res.json({
            success:true,
            messages
        })
    } catch(error){
        res.status(500).json({
            success:false,
            message:'Could not fetch personal messages',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

export const markMessagesAsread=async(req,res)=>{
    try {
        const {chatId}=req.params

        await Chat.findOneAndUpdate(
            chatId,
            {
                $addToSet:{
                    readBy:{
                        user:req.user._id,
                        readAt:new Date()
                    }
                }
            },
            {new:true}
        )

        res.json({success:true})

    } catch (error) {
        res.status(500).json({
            success:false,
            message:'Could not mark messages as read',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}