import Workspace from "../models/Workspace.js";
import crypto from 'crypto';
import User from '../models/User.js'
import sendEmail from '../utils/sendEmail.js'

export const createWorkspace = async(req,res)=>{
    try{
        console.log('Request user:', req.user); // Check if user exists
        console.log('Request body:', req.body); // Check incoming data
        const {name,description,isPrivate}=req.body;
        const workspace=new Workspace({
            name,
            description,
            owner:req.user._id,
            members:[{
                user:req.user._id,
                role:'admin',
                status:'active'
            }],
            settings:{
                isPrivate,
                inviteCode:crypto.randomBytes(6).toString('hex')
            }
        });

        await workspace.save();

        const savedWorkspace = await Workspace.findById(workspace._id);

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
        console.log('Finding workspaces for user:', req.user._id);
        
        
        // Debug: First check if workspaces exist at all
        const allWorkspaces = await Workspace.find({});
        console.log('All workspaces in DB:', allWorkspaces);
        
        // Debug: Check specific workspace by ID
        const specificWorkspace = await Workspace.findById('678bc45be010272e8b2afcb8');
        console.log('Specific workspace:', specificWorkspace);
        const workspaces=await Workspace.find({
            'members.user':req.user._id,
            status:'active'
        })
        .populate('owner','name email')
        .populate('members.user','name email')
        .sort('-createdAt')

        console.log('Found workspaces:', workspaces);

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
        const workspaceExists = await Workspace.findById(req.params.id);
        console.log('Basic workspace check:', workspaceExists);
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

export const joinWorkspace=async(req,res)=>{
    try {
        const {inviteCode}=req.body;
        const workspace=await Workspace.findOne({
            'settings.inviteCode':inviteCode,
            status:'active'
        })

        if(!workspace){
            return res.status(400).json({
                success:false,
                message:'Invalid invite code or workspace not found'
            })
        }

        if(workspace.isMember(req.user._id)){
            return res.status(400).json({
                success:false,
                message:'You are already a member of this workspace'
            })
        }

        workspace.members.push({
            user:req.user._id,
            role:'member',
            status:'active',
        })

        await workspace.save()

        req.user.workspaces.push({
            workspace:workspace._id,
            role:'member',
            lastAccessed:Date.now()
        })

        await req.user.save()

        res.json({
            success:true,
            message:'Successfully joined workspace',
            workspace
        })
    } catch (error) {
        console.error('Join workspace error:',error)
        res.status(500).json({
            success:false,
            message:'Could not join workspace',
            error:process.env.NODE_ENV==='development'? error.message:undefined
        })
    }
}

export const updateWorkspaceSettings=async(req,res)=>{
    try {
        const workspace=await Workspace.findOne({
            _id:req.params.id,
            status:'active'
        })

        if(!workspace){
            return res.status(404).json({
                success:false,
                message:'Workspace not found'
            })
        }

        if(!workspace.isAdmin(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Only admins can update workspace settings'
            })
        }

        const allowedUpdates=['name','description','isPrivate','joinByCode','theme'];
        const updates=Object.keys(req.body);

        updates.forEach(update=>{
            if(allowedUpdates.includes(update)){
                if(update==='isPrivate' || update==='joinByCode'){
                    workspace.settings[update]=req.body[update]
                }
                else if(update==='theme'){
                    workspace.settings.theme=req.body[update]
                }
                else{
                    workspace[update]=req.body[update]
                }
            }
        })

        await workspace.save();

        res.json({
            success:true,
            message:'Workspace settings updated',
            workspace
        })

    } catch (error) {
        console.error('Update workspace settings error:',error)
        res.status(500).json({
            success:false,
            message:'Could not update workspace settings',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}