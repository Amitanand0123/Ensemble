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
        console.error('Delete project error:',error)
        res.status(500).json({
            success:false,
            message:'Could not delete project',
            error:process.env.NODE_ENV==='development'?error.message:undefined
        })
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

export const inviteToProject = async (req, res) => {
    const { projectId } = req.params;
    const { email, role = 'member' } = req.body; 
    const inviterId = req.user._id;

    const allowedRoles = ['admin', 'member', 'viewer']; 
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role specified for project.' });
    }

    try {
        const project = await Project.findById(projectId).populate('workspace', 'members'); 
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        
        if (!project.isAdmin(inviterId)) {
            return res.status(403).json({ success: false, message: 'Only project admins can invite members.' });
        }

        const userToInvite = await User.findOne({ email: email.toLowerCase() });
        if (!userToInvite) {
            return res.status(404).json({ success: false, message: `User with email ${email} not found.` });
        }

         
         const workspace = await Workspace.findById(project.workspace);
         if (!workspace || !workspace.isMember(userToInvite._id)) {
             return res.status(400).json({ success: false, message: `User must be a member of the workspace '${workspace?.name || 'Unknown'}' before being added to this project.` });
         }


        
        if (project.isMember(userToInvite._id)) {
            return res.status(400).json({ success: false, message: 'User is already a member of this project.' });
        }

        project.members.push({ user: userToInvite._id, role: role, status: 'active' });
        await project.save();

        

        res.status(200).json({ success: true, message: `User ${email} added to the project.` });

    } catch (error) {
        console.error('Invite to project error:', error);
        res.status(500).json({ success: false, message: 'Failed to invite user to project.' });
    }
};


export const updateMemberRoleInProject = async (req, res) => {
    const { projectId, memberUserId } = req.params;
    const { role: newRole } = req.body;
    const requesterId = req.user._id;

    const allowedRoles = ['admin', 'member', 'viewer']; 
     if (!newRole || !allowedRoles.includes(newRole)) {
         return res.status(400).json({ success: false, message: 'Invalid role specified.' });
     }

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        
        if (!project.isAdmin(requesterId)) {
            return res.status(403).json({ success: false, message: 'Only project admins can change member roles.' });
        }

        
         if (project.owner.toString() === memberUserId) {
             
             return res.status(400).json({ success: false, message: 'Cannot change the role of the project owner.' });
         }

        const memberIndex = project.members.findIndex(m => m.user.toString() === memberUserId);
        if (memberIndex === -1) {
            return res.status(404).json({ success: false, message: 'Member not found in this project.' });
        }

        

        project.members[memberIndex].role = newRole;
        await project.save();

        res.status(200).json({ success: true, message: 'Project member role updated.' });

    } catch (error) {
        console.error('Update project member role error:', error);
        res.status(500).json({ success: false, message: 'Failed to update project member role.' });
    }
};


export const removeMemberFromProject = async (req, res) => {
    const { projectId, memberUserId } = req.params;
    const requesterId = req.user._id;

    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found.' });
        }

        
        if (!project.isAdmin(requesterId)) {
            return res.status(403).json({ success: false, message: 'Only project admins can remove members.' });
        }

        
        if (project.owner.toString() === memberUserId) {
            return res.status(400).json({ success: false, message: 'Cannot remove the project owner.' });
        }

         
         if (memberUserId === requesterId) {
            return res.status(400).json({ success: false, message: 'Admins cannot remove themselves from a project.' });
         }


        const initialMemberCount = project.members.length;
        project.members = project.members.filter(m => m.user.toString() !== memberUserId);

        if (project.members.length === initialMemberCount) {
            return res.status(404).json({ success: false, message: 'Member not found in this project.' });
        }

        await project.save();

        res.status(200).json({ success: true, message: 'Member removed from project.' });

    } catch (error) {
        console.error('Remove project member error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove member from project.' });
    }
};