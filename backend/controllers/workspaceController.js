import Workspace from "../models/Workspace.js";
import crypto from 'crypto';
import User from '../models/User.js'
import sendEmail from '../utils/sendEmail.js'

export const createWorkspace = async(req,res)=>{
    try{
        console.log('Request user:', req.user); // Check if user exists
        console.log('Request body:', req.body); // Check incoming data
        if(req.user.role!=='admin'){
            return res.status(403).json({
                success:false,
                message:'Only admins can create workspaces'
            })
        }
        const {name,description,isPrivate}=req.body;
        if(!name){
            return res.status(400).json({
                success:false,
                message:'Workspace name is required'
            })
        }
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
                isPrivate:isPrivate || false,
                inviteCode:crypto.randomBytes(6).toString('hex')
            },
            status:'active'
        });

        await workspace.save();
        const user=await User.findById(req.user._id);
        if(user){
            user.workspaces.push({
                workspace:workspace._id,
                role:'admin',
                lastAccessed:Date.now()
            });
            await user.save({validateBeforeSave:false});
        }
        else{
            console.warn(`User ${req.uesr._id} not found when trying to update workspace list.`)
        }

        const populatedWorkspace=await Workspace.findById(workspace._id)
                .populate('owner','name email')
                .populate('members.user','name email');

        res.status(201).json({
            success:true,
            workspace:populatedWorkspace
        });
    } catch(error){
        console.log('Crete workspace error: ',error);
        if(error.code==11000){
            return res.status(400).json({
                success:false,
                message:'Workspace name already exists.'
            })
        }
        res.status(500).json({
            success:false,
            message:'Could not create workspace',
            error:process.env.NODE_ENV==='development' ? error.message:undefined
        })
    }
}

export const getWorkspaces =async(req,res)=>{
    try{
        if(!req.user || !req.user._id){
            return res.status(401).json({
                success:false,
                message:'User not authenticated'
            })
        }
        console.log('Finding workspaces for user:', req.user._id);
        const workspaces=await Workspace.find({
            'members.user':req.user._id,
            status:'active'
        })
        .populate('owner','name email')
        .populate('members.user','name email')
        .sort('-createdAt')

        console.log(`Found ${workspaces.length} workspaces for user ${req.user._id}`);

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
        if(!inviteCode){
            return res.status(400).json({success:false,message:'Invite code is required'})
        }
        const workspace=await Workspace.findOne({
            'settings.inviteCode':inviteCode,
            status:'active'
        })

        if(!workspace){
            return res.status(404).json({
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
            joinedAt:Date.now()
        })

        await workspace.save()
        const user=await User.findById(req.user._id);
        if(user){
            const alreadyAdded=user.workspaces.find(w=>w.workspace.toString()===workspace._id.toString())
            if(!alreadyAdded){
                user.workspaces.push({
                    workspace:workspace._id,
                    role:'member',
                    lastAccessed:Date.now()
                })
                await user.save({validateBeforeSave:false})
            }
        }
        else{
            console.warn(`User ${req.user._id} not found when trying to update workspace list after joining.`)
        }
        const populatedWorkspace=await Workspace.findById(workspace._id)
                .populate('owner','name email')
                .populate('members.user','name email');
        
        res.json({
            success:true,
            message:'Successfully joined workspace',
            workspace:populatedWorkspace
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

export const inviteToWorkspace=async(req,res)=>{
    try {
        const {email,role}=req.body;
        const workspace=await Workspace.findById(req.params.id);

        if(!workspace){
            return res.status(404).json({success:false,message:'Workspace not found'})
        }
        if(!workspace.isAdmin(req.user._id)){
            return res.status(403).json({success:false,message:'Only admins can invite users'})
        }

        const user=await User.findOne({email});
        if(!user){
            return res.status(404).json({success:false,message:'User not found'})
        }

        if(workspace.isMember(user._id)){
            return res.status(400).json({success:false,message:'User is already a member'})
        }
        workspace.members.push({user:user._id,role,status:'pending'})
        await workspace.save()

        await sendEmail({
            email:user.email,
            subject:'Workspace Invitation',
            message:`You have been invited to join the "${workspace.name}" workspace.`
        })
        
        res.json({success:true,message:'Invitation sent successfully'})
    } catch (error) {
        console.error('Invite to workspace error:',error);
        res.status(500).json({success:false,message:'Could not send invitation',error:process.env.NODE_ENV==='development'?error.message:undefined})
    }
}