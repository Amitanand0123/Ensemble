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

// export const inviteToWorkspace=async(req,res)=>{
//     try {
//         const {email,role}=req.body;
//         const workspace=await Workspace.findById(req.params.id);

//         if(!workspace){
//             return res.status(404).json({success:false,message:'Workspace not found'})
//         }
//         if(!workspace.isAdmin(req.user._id)){
//             return res.status(403).json({success:false,message:'Only admins can invite users'})
//         }

//         const user=await User.findOne({email});
//         if(!user){
//             return res.status(404).json({success:false,message:'User not found'})
//         }

//         if(workspace.isMember(user._id)){
//             return res.status(400).json({success:false,message:'User is already a member'})
//         }
//         workspace.members.push({user:user._id,role,status:'pending'})
//         await workspace.save()

//         await sendEmail({
//             email:user.email,
//             subject:'Workspace Invitation',
//             message:`You have been invited to join the "${workspace.name}" workspace.`
//         })
        
//         res.json({success:true,message:'Invitation sent successfully'})
//     } catch (error) {
//         console.error('Invite to workspace error:',error);
//         res.status(500).json({success:false,message:'Could not send invitation',error:process.env.NODE_ENV==='development'?error.message:undefined})
//     }
// }

export const inviteToWorkspace = async (req, res) => {
    const { workspaceId } = req.params;
    const { email, role = 'member' } = req.body; // Default role to 'member'
    const inviterId = req.user._id;

    const allowedRoles = ['admin', 'member'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found.' });
        }

        // Check if the inviter is an admin
        if (!workspace.isAdmin(inviterId)) {
            return res.status(403).json({ success: false, message: 'Only workspace admins can invite members.' });
        }

        const userToInvite = await User.findOne({ email: email.toLowerCase() });
        if (!userToInvite) {
            // Consider sending an email inviting them to sign up first, or just return error
            return res.status(404).json({ success: false, message: `User with email ${email} not found.` });
        }

        // Check if user is already a member
        if (workspace.isMember(userToInvite._id)) {
            return res.status(400).json({ success: false, message: 'User is already a member of this workspace.' });
        }

        // Add member with 'pending' status (or 'active' if skipping acceptance step)
        workspace.members.push({ user: userToInvite._id, role: role, status: 'active' }); // Directly add as active for simplicity now
        await workspace.save();

        // Also update the user document (optional but good practice)
         const userAlreadyHasWorkspace = userToInvite.workspaces.some(w => w.workspace.toString() === workspaceId);
         if (!userAlreadyHasWorkspace) {
            userToInvite.workspaces.push({ workspace: workspace._id, role: role, lastAccessed: new Date() });
            await userToInvite.save({ validateBeforeSave: false });
         }


        // Optional: Send notification email
        try {
            await sendEmail({
                email: userToInvite.email,
                subject: `You're invited to the ${workspace.name} workspace!`,
                message: `${req.user.name.first} invited you to join the "${workspace.name}" workspace on Ensemble. You've been added directly. Log in to access it.`,
                // html: `<p>...</p>` // Optional HTML version
            });
        } catch (emailError) {
            console.error(`Failed to send invitation email to ${email}:`, emailError);
            // Don't fail the whole request if email fails, but log it
        }

        res.status(200).json({ success: true, message: `User ${email} added to the workspace.` });

    } catch (error) {
        console.error('Invite to workspace error:', error);
        res.status(500).json({ success: false, message: 'Failed to invite user.' });
    }
};

// --- Update Member Role in Workspace ---
export const updateMemberRoleInWorkspace = async (req, res) => {
    const { workspaceId, memberUserId } = req.params;
    const { role: newRole } = req.body;
    const requesterId = req.user._id;

    const allowedRoles = ['admin', 'member'];
    if (!newRole || !allowedRoles.includes(newRole)) {
        return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found.' });
        }

        // Check if requester is admin
        if (!workspace.isAdmin(requesterId)) {
            return res.status(403).json({ success: false, message: 'Only admins can change member roles.' });
        }

        // Prevent changing owner's role
        if (workspace.owner.toString() === memberUserId) {
            return res.status(400).json({ success: false, message: 'Cannot change the role of the workspace owner.' });
        }

        const memberIndex = workspace.members.findIndex(m => m.user.toString() === memberUserId);
        if (memberIndex === -1) {
            return res.status(404).json({ success: false, message: 'Member not found in this workspace.' });
        }

        // Prevent admin from demoting themselves if they are the only admin (besides owner)
         const adminCount = workspace.members.filter(m => m.role === 'admin' && m.user.toString() !== workspace.owner.toString()).length;
         if (workspace.members[memberIndex].role === 'admin' && newRole === 'member' && adminCount <= 1 && memberUserId === requesterId) {
            // This logic might need adjustment based on whether owner is also in members list with 'admin' role
             // Simplified: Just prevent demoting self for now. More complex logic needed for "last admin" scenario.
             if (memberUserId === requesterId) {
                return res.status(400).json({ success: false, message: "You cannot demote yourself." });
             }
         }


        workspace.members[memberIndex].role = newRole;
        await workspace.save();

         // Update user's workspace role as well
         const user = await User.findById(memberUserId);
         if (user) {
             const workspaceInUser = user.workspaces.find(w => w.workspace.toString() === workspaceId);
             if (workspaceInUser) {
                 workspaceInUser.role = newRole;
                 await user.save({ validateBeforeSave: false });
             }
         }

        res.status(200).json({ success: true, message: 'Member role updated.' });

    } catch (error) {
        console.error('Update member role error:', error);
        res.status(500).json({ success: false, message: 'Failed to update member role.' });
    }
};

// --- Remove Member from Workspace ---
export const removeMemberFromWorkspace = async (req, res) => {
    const { workspaceId, memberUserId } = req.params;
    const requesterId = req.user._id;

    try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return res.status(404).json({ success: false, message: 'Workspace not found.' });
        }

        // Check if requester is admin
        if (!workspace.isAdmin(requesterId)) {
            return res.status(403).json({ success: false, message: 'Only admins can remove members.' });
        }

        // Prevent removing owner
        if (workspace.owner.toString() === memberUserId) {
            return res.status(400).json({ success: false, message: 'Cannot remove the workspace owner.' });
        }

        // Prevent removing self (admin) - might need more complex logic for "last admin"
        if (memberUserId === requesterId) {
            return res.status(400).json({ success: false, message: 'Admins cannot remove themselves. Ask another admin or transfer ownership.' });
        }

        const initialMemberCount = workspace.members.length;
        workspace.members = workspace.members.filter(m => m.user.toString() !== memberUserId);

        if (workspace.members.length === initialMemberCount) {
            return res.status(404).json({ success: false, message: 'Member not found in this workspace.' });
        }

        await workspace.save();

         // Remove workspace from user's list
         const user = await User.findById(memberUserId);
         if (user) {
             user.workspaces = user.workspaces.filter(w => w.workspace.toString() !== workspaceId);
             await user.save({ validateBeforeSave: false });
         }

        res.status(200).json({ success: true, message: 'Member removed from workspace.' });

    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove member.' });
    }
};

export const deleteWorkspace=async(req,res)=>{
    const {id}=req.params;
    const requesterId=req.user._id;
    try {
        const workspace=await Workspace.findById(id);
        if(!workspace){
            return res.status(404).json({
                success:false,
                message:'Workspace not found'
            })
        }
        if(workspace.owner.toString()!==requesterId.toString()){
            return res.status(403).json({
                success:false,
                message:'Only the owner can delete this workspace'
            })
        }
        await workspace.deleteOne();
        await User.updateMany(
            {'workspaces.workspace':id},
            {$pull:{workspaces:{workspace:id}}}
        )
        res.status(200).json({
            success:true,
            message:'Workspace deleted successfully'
        })
    } catch (error) {
        console.error('Delete workspace error: ',error);
        res.status(500).json({
            success:false,
            message:'Could not delete workspace',
            error:process.env.NODE_ENV==='development' ? error.message:undefined
        })
    }
}