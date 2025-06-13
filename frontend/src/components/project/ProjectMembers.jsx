import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { MoreVertical, UserPlus, ShieldCheck, Shield, Trash2, Loader2, UserX } from 'lucide-react';
import InviteMemberModal from '../workspace/InviteMemberModal';
import {
    fetchProjectDetail,
    updateProjectMemberRole,
    removeProjectMember,
} from '../../redux/slices/projectSlice';
import { toast } from 'react-hot-toast';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import PropTypes from 'prop-types';

const ProjectMembers = ({ project }) => {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector(state => state.auth);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState({ type: null, id: null });

    const members = project?.members || [];
    const projectId = project?._id;
    const isCurrentUserProjectAdmin = project?.members?.some(m => m.user?._id === currentUser?._id && m.role === 'admin');
    const ownerId = project?.owner?._id || project?.owner;

    const projectRoles = [
        { value: 'member', label: 'Member' },
        { value: 'admin', label: 'Admin' },
        { value: 'viewer', label: 'Viewer' },
    ];

    if (!project) {
        return <p className="text-gray-400 p-4">Loading project data...</p>;
    }

    const handleRoleChange = async (memberUserId, newRole) => {
        if (!projectId || !memberUserId) return;
        setActionLoading({ type: 'role', id: memberUserId });
        try {
            await dispatch(updateProjectMemberRole({ projectId, memberUserId, role: newRole })).unwrap();
            toast.success('Project member role updated.');
        } catch (error) {
            toast.error(error || 'Failed to update role.');
        } finally {
            setActionLoading({ type: null, id: null });
        }
    };

    const handleRemoveMember = async (memberUserId) => {
        if (!projectId || !memberUserId) return;
        setActionLoading({ type: 'remove', id: memberUserId });
        try {
            await dispatch(removeProjectMember({ projectId, memberUserId })).unwrap();
            toast.success('Member removed from project.');
        } catch (error) {
            toast.error(error || 'Failed to remove member.');
        } finally {
             setActionLoading({ type: null, id: null });
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Project Members ({members.length})</h3>
                {isCurrentUserProjectAdmin && (
                    <Button onClick={() => setIsInviteModalOpen(true)} size="sm">
                        <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                    </Button>
                )}
            </div>
            <div className="space-y-3">
                {members.map((member) => {
                    if (!member || !member.user) return null;
                    
                    const memberUserId = member.user._id;
                    const isOwner = memberUserId === ownerId;
                    const isSelf = memberUserId === currentUser?._id;
                    const canManageMember = isCurrentUserProjectAdmin && !isOwner && !isSelf;
                    const memberName = `${member.user.name?.first || ''} ${member.user.name?.last || ''}`.trim() || 'No Name';
                    const isLoadingAction = actionLoading.id === memberUserId;

                    return (
                        <Card key={member._id || memberUserId} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-white">
                            <CardContent className="flex items-center space-x-4 p-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={member.user.avatar?.url} alt={memberName} />
                                    <AvatarFallback className="bg-gray-600">{getInitials(member.user.name?.first, member.user.name?.last)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{memberName}</p>
                                    <p className="text-sm text-gray-400">{member.user.email || 'No Email'}</p>
                                </div>
                                <div className="ml-auto flex items-center space-x-2">
                                    {isLoadingAction && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                        isOwner ? 'bg-yellow-600' :
                                        member.role === 'admin' ? 'bg-purple-600' :
                                        member.role === 'member' ? 'bg-blue-600' :
                                        'bg-gray-600'
                                    }`}>
                                        {isOwner ? 'Owner' : member.role}
                                    </span>
                                    {canManageMember && !isLoadingAction && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                                                 {projectRoles.map(r => {
                                                     if (r.value === member.role) return null;
                                                     const Icon = r.value === 'admin' ? ShieldCheck : r.value === 'member' ? Shield : UserX;
                                                     return (
                                                        <DropdownMenuItem
                                                            key={r.value}
                                                            disabled={isLoadingAction}
                                                            onClick={() => handleRoleChange(memberUserId, r.value)}
                                                            className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700"
                                                        >
                                                            <Icon className={`mr-2 h-4 w-4 ${r.value === 'admin' ? 'text-purple-400' : 'text-gray-400'}`} /> Set as {r.label}
                                                        </DropdownMenuItem>
                                                     );
                                                 })}
                                                <DropdownMenuSeparator className="bg-gray-700" />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem disabled={isLoadingAction} onSelect={(e) => e.preventDefault()} className="cursor-pointer text-red-400 hover:bg-red-900/50 hover:text-red-300 focus:bg-red-900/50 focus:text-red-300">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Remove from Project...
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-gray-300">
                                                                This will remove {memberName} from this project. They might still have access via the workspace.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleRemoveMember(memberUserId)} className="bg-red-600 hover:bg-red-700">Yes, Remove</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <InviteMemberModal
                contextType="project"
                contextId={projectId}
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInviteSuccess={() => dispatch(fetchProjectDetail(projectId))}
                availableRoles={projectRoles}
            />
        </div>
    );
};

ProjectMembers.propTypes={
    project:PropTypes.object.isRequired
}

export default ProjectMembers;