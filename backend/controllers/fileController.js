import File from '../models/File.js';
import Project from '../models/Project.js';
import { uploadToCloud,deleteFromCloud } from '../utils/fileUpload.js';
import Workspace from '../models/Workspace.js';
import mongoose from 'mongoose';
import { extractTexFromFile, summarizeText } from '../utils/aiService.js';

export const uploadWorkspaceFile=async(req,res)=>{
    const {workspaceId}=req.params;
    if(!req.files || req.files.length===0){
        return res.status(400).json({
            success:false,
            message:'No files uploaded'
        })
    }
    if(!mongoose.Types.ObjectId.isValid(workspaceId)){
        return res.status(400).json({
            success:false,
            message:'Invalid workspace ID format'
        })
    }
    try {
        const workspace=await Workspace.findById(workspaceId);
        if(!workspace || !workspace.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to upload files to this workspace'
            })
        }
        const uploadedFilesInfo=[];
        for(const file of req.files){
            const result=await uploadToCloud(file.buffer,file.originalname,`workspace/${workspaceId}`);
            const newFile=new File({
                filename:file.originalname,
                url:result.url,
                public_id:result.public_id,
                mimetype:file.mimetype,
                size:file.size,
                uploadedBy:req.user._id,
                workspace:workspaceId
            })
            await newFile.save();
            await newFile.populate('uploadedBy','name email avatar')
            uploadedFilesInfo.push(newFile);
        }
        res.status(201).json({
            success:true,
            message:`${uploadedFilesInfo.length} file(s) uploaded successfully.`,
            files:uploadedFilesInfo
        })
    } catch (error) {
        console.error("Workspace file upload error:",error);
        res.status(500).json({
            success:false,
            message:'Server error during file upload.'
        })
    }
}

export const uploadProjectFile=async(req,res)=>{
    const {projectId}=req.params;
    if(!req.files || req.files.length===0){
        return res.status(400).json({
            success:false,
            message:'No files uploaded'
        })
    }
    if(!mongoose.Types.ObjectId.isValid(projectId)){
        return res.status(400).json({
            success:false,
            message:'Invalid project ID format'
        })
    }
    try {
        const project=await Project.findById(projectId);
        if(!project || !project.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to upload files to this project'
            })
        }
        const uploadedFilesInfo=[];
        for(const file of req.files){
            const result=await uploadToCloud(file.buffer,file.originalname,`project/${projectId}`);
            const newFile=new File({
                filename:file.originalname,
                url:result.url,
                public_id:result.public_id,
                mimetype:file.mimetype,
                size:file.size,
                uploadedBy:req.user._id,
                project:projectId
            })
            await newFile.save();
            await newFile.populate('uploadedBy','name email avatar')
            uploadedFilesInfo.push(newFile);
        }
        res.status(201).json({
            success:true,
            message:`${uploadedFilesInfo.length} file(s) uploaded successfully.`,
            files:uploadedFilesInfo
        })
    } catch (error) {
        console.error("Project file upload error:",error);
        res.status(500).json({
            success:false,
            message:'Server error during file upload.'
        })
    }
}

export const getWorkspaceFiles=async(req,res)=>{
    const {workspaceId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(workspaceId)){
        return res.status(400).json({
            success:false,
            message:'Invalid workspace ID format'
        })
    }
    try {
        const workspace=await Workspace.findById(workspaceId);
        if(!workspace || !workspace.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to view files in this workspace'
            })
        }
        const files=await File.find({workspace:workspaceId})
                    .populate('uploadedBy','name email avatar')
                    .sort({createdAt:-1});
        
        res.status(200).json({
            success:true,
            files
        })
    } catch (error) {
        console.error("Workspace file fetch error:",error);
        res.status(500).json({
            success:false,
            message:'Server error fetching files.'
        })
    }
}

export const getProjectFiles=async(req,res)=>{
    const {projectId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(projectId)){
        return res.status(400).json({
            success:false,
            message:'Invalid project ID format'
        })
    }
    try {
        const project=await Project.findById(projectId);
        if(!project || !project.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to view files in this project'
            })
        }
        const files=await File.find({project:projectId})
                    .populate('uploadedBy','name email avatar')
                    .sort({createdAt:-1});
        
        res.status(200).json({
            success:true,            
            files
        })
    } catch (error) {
        console.error("Get project files error:",error);
        res.status(500).json({
            success:false,
            message:'Server error fetching files.'
        })
    }
}

export const deleteFile=async(req,res)=>{
    const {fileId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(fileId)){
        return res.status(400).json({
            success:false,
            message:'Invalid file ID format'
        })
    }
    try {
        const file=await File.findById(fileId);
        if(!file){
            return res.status(404).json({
                success:false,
                message:'File not found'
            })
        }
        let isAuthorized=false;
        if(file.uploadedBy.toString()===req.user._id.toString()){
            isAuthorized=true;
        }
        else{
            if(file.workspace){
                const workspace=await Workspace.findById(file.workspace);
                if(workspace && workspace.isAdmin(req.user._id)){
                    isAuthorized=true;
                }
            }
            else if(file.project){
                const project=await Project.findById(file.project);
                if(project && project.isMember(req.user._id)){
                    isAuthorized=true;
                }
            }
        }
        if(!isAuthorized){
            return res.status(403).json({
                success:false,
                message:'You do not have permission to delete this file.'
            })
        }
        await deleteFromCloud(file.public_id);
        await File.findByIdAndDelete(fileId);
        res.status(200).json({
            success:true,
            message:'File deleted successfully'
        })
    } catch (error) {
        console.error("Delete file error:",error);
        res.status(500).json({
            success:false,
            message:'Server error during file deletion.'
        })
    }
}

export const summarizeFile=async(req,res)=>{
    const {fileId}=req.params;
    if(!mongoose.Types.ObjectId.isValid(fileId)){
        return res.status(400).json({
            success:false,
            message:'Invalid file ID format'
        })
    }
    try {
        const file=await File.findById(fileId);
        if(!file){
            return res.status(404).json({
                success:false,
                message:'File not found'
            })
        }
        let isAuthorized=false;
        if(file.workspace){
            const workspace=await Workspace.findById(file.workspace);
            if(workspace && workspace.isMember(req.user._id)){
                isAuthorized=true;
            }
        }
        else if(file.project){
            const project=await Project.findById(file.project);
            if(project && project.isMember(req.user._id)){
                isAuthorized=true
            }
        }

        if(!isAuthorized){
            return res.status(403).json({
                success:false,
                message:'You do not have permission to access this file.'
            })
        }
        let textContent;
        try {
            textContent=await extractTexFromFile(file.url,file.mimetype)
        } catch (error) {
            return res.status(400).json({
                success:false,
                message:error.message
            })
        }

        if(!textContent || textContent.trim().length===0){
            return res.status(400).json({
                success:false,
                message:'No text content found in the file to summarize'
            })
        }
        const summary=await summarizeText(textContent,file.filename)
        res.status(200).json({
            success:true,
            fileId:file._id,
            filename:file.filename,
            summary:summary
        })
    } catch (error) {
        console.error(`Error summarizing file ${fileId}:`,error)
        if(error.message.includes("AI Service is not configured")){
            return res.status(503).json({
                success:false,
                message:error.message
            })
        }
        res.status(500).json({
            success:false,
            message:'Server error during file summarization'
        })
    }
}