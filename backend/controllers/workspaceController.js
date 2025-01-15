import Workspace from "../models/Workspace.js";
import crypto from 'crypto';

export const createWorkspace = async(req,res)=>{
    try{
        const {name,description,isPrivate}=req.body;
        const workspace=new Workspace({
            name,
            description,
            owner:req.user._id,
            members:[{user:req.user._id,role:'admin'}],
            settings:{
                isPrivate,
                inviteCode:crypto.randomBytes(6).toString('hex')
            }
        });

        await workspace.save();

        req.user.workspaces.push({
            workspace:workspace._id,
            role:'owner',
            lastAccessed:Date.now()
        });

        await req.user.save();

        res.status(201).json({
            success:true,
            workspace
        });
    } catch(error){
        console.log('Crete workspace error: ',error);
        res.status(500).json({
            success:false,
            message:'Could not create workspace',
            error:process.env.NODE_ENV==='development' ? error.message:undefined
        })
    }
}

export const getWorkspaces =async(req,res)=>{
    try{
        const workspaces=await Workspace.find({
            'members.user':req.user._id,
            status:'active'
        })
        .populate('owner','name email')
        .populate('members.user','name email')
        .sort('-craetedAt')

        res.json({
            success:true,
            count:workspaces.length,
            workspaces
        });
    } catch(error){
        console.error('Get workspaces error: ',error);
        res.status(500).json({
            success:false,
            message:'Could not fetch workspaces',
            error:process.env.NODE_ENV==='developement' ? error.message:undefined
        });
    }
}

export const getWorkspaceById=async(req,res)=>{
    try{
        const workspace=await Workspace.findOne({
            _id:req.params.id,
            'members.user':req.user._id,
            status:'active'
        })
        .populate('owner','name email')
        .populate('members.user','name email');

        if(!workspace){
            return res.status(404).json({
                success:false,
                message:'Workspace not found'
            });
        }

        res.json({
            success:true,
            workspace
        });
    } catch(error){
        console.error('Get workspace error: ',error);
        res.status(500).json({
            successl:false,
            message:'Could not fetch workspace',
            error:process.env.NODE_ENV==='development' ? error.message:undefined
        })
    }
}