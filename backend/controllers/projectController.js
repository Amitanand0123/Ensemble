import Project from '../models/Project.js'
import User from '../models/User.js';
import Workspace from '../models/Workspace.js'

export const createProject=async(req,res)=>{
    try {
        const {name,description,workspace,priority,endDate,settings}=req.body;

        const workspaceDoc=await Workspace.findById(workspace);
        if(!workspaceDoc){
            return res.status(404).json({
                success:false,
                message:'Workspace not found'
            })
        }

        if(!workspaceDoc){
            return res.status(404).json({
                success:false,
                message:'Workspace not found'
            })
        }

        if(!workspaceDoc.isMember(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'You do not have permission to create a project in this workspace'
            })
        }

        const project=new Project({
            name,
            description,
            workspace,
            owner:req.user._id,
            members:[{
                user:req.user._id,
                role:'admin',
                status:'active'
            }],
            priority,
            endDate,
            settings:{
                isPrivate:settings?.isPrivate || false,
                tags:settings?.tags || [],
                visibility:settings?.visibility || 'workspace'
            }
        })

        await project.save();

        res.status(201).json({
            success:true,
            project
        })

    } catch (error) {
        console.error('Create project error:',error);
        res.status(500).json({
            success:false,
            message:'Could not create project',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}
export const getProjects=async(req,res)=>{
    try {
        const projects=await Project.find({
            'members.user':req.user._id,
            'members.status':'active'
        })
        .populate('owner','name email')
        .populate('members.user','name email')
        .sort('-createdAt');
        
        res.json({
            success:true,
            count:projects.length,
            projects
        })
    } catch (error) {
        console.error('Get projects error:',error)
        res.status(500).json({
            success:false,
            message:'Could not fetch projects',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

export const getProjectById=async(req,res)=>{
    try {
        const project=await Project.findOne({
            _id:req.params.id,
            'members.user':req.user._id,
            'members.status':'active'
        })
        .populate('owner','name email')
        .populate('members.user','name email')

        if(!project){
            return res.status(404).json({
                success:false,
                message:'project not found'
            })
        }

        res.json({
            success:true,
            project
        })

    } catch (error) {
        console.error('Get project error:',error);
        res.status(500).json({
            success:false,
            message:'Could not fetch project',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

export const updateProject=async(req,res)=>{
    try {
        const project=await Project.findById(req.params.id);
        if(!project){
            return res.status(404).json({
                success:false,
                message:'Project not found'
            })
        }

        if(!project.isAdmin(req.user._id)){
            return res.status(403).json({
                success:false,
                message:'Not authorized to update this project'
            })
        }

        const allowedUpdates=['name','description','status','priority','endDate','settings.isPrivate','settings.tags','settings.visibility']

        const updates=Object.keys(req.body);
        const isValidOperation=updates.every(update=>allowedUpdates.includes(update));

        if(!isValidOperation){
            return res.status(400).json({
                success:false,
                message:'Invalid updates!'
            })
        }

        updates.forEach(update=>{
            const keys=update.split('.');
            if(keys.length>1){
                project[keys[0]][keys[1]]=req.body[update]
            }
            else{
                project[update]=req.body[update]
            }
        })
        
        await project.save();

        res.json({
            success:true,
            project
        })

    } catch (error) {
        console.error('Update project error:',error)
        res.status(500).json({
            success:false,
            message:'Could not update project',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

export const deleteProject=async(req,res)=>{
    try {
        const project =await Project.findById(req.params.id);
        if(!project){
            return res.status(404).json({
                success:false,
                message:'Project not found'
            })
        }

        if(project.owner.toString()!==req.user._id.toString()){
            return res.status(403).json({
                success:false,
                message:'Not authorized to delete this project'
            })
        }

        await project.deleteOne()

        res.json({
            success:true,
            message:'Project deleted successfully'
        })

    } catch (error) {
        console.errror('Delete project error:',error)
        res.status(500).json({
            success:false,
            message:'Could not delete project',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

export const inviteToProject=async(req,res)=>{
    try {
        
        const {email,role}=req.body;
        const project=await Project.findById(req.params.id);

        if(!project){
            return res.status(404).json({success:false,message:'Project not found'})
        }
        if(!project.isAdmin(req.user._id)){
            return res.status(403).json({success:false,message:'Only admins can invite users'})
        }
        const user=await User.findOne({email});
        if(!user){
            return res.status(404).json({success:false,message:'user not found'})
        }
        if(project.isMember(user._id)){
            return res.status(400).json({success:false,message:'User is already a member'})
        }
        project.members.push({user:user._id,role,status:'pending'})
        await project.save();

        await sendEmail({
            email:user.email,
            subject:'Project Invitation',
            message:`You have been invited to join the "${project.name}" project.`
        })
        res.json({success:true,message:'Invitation sent successfully'})

    } catch (error) {
        console.error('Invite to project error',error);
        res.status(500).json({success:false,message:'Could not send invitation',error:process.env.NODE_ENV==='development'?error.message:undefined})
    }
}

export const getProjectByWorkspaceId=async(req,res)=>{
    const {workspaceId}=req.params
    try {
        const projects=await Project.find({
            workspace:workspaceId,
            'members.user':req.user._id,
            'members.status':'active'
        })
        .populate('owner','name email')
        .populate('members.user','name email')
        .sort('-createdAt')

        res.json({
            success:true,
            count:projects.length,
            projects
        })
    } catch (error) {
        console.error('Get projects by workspace ID error:',error)
        res.status(500).json({
            success:false,
            message:'Could not fetch projects for this workspace',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
    }
}

