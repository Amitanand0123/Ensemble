// --- START OF FILE MembersList.jsx ---

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { MoreVertical, UserPlus, ShieldCheck, Shield, Trash2, Loader2 } from 'lucide-react'; // Import icons
import InviteMemberModal from './InviteMemberModal'; // Import the modal
// Import Redux actions
import {
    fetchWorkspaceDetail, // To refresh data
    updateWorkspaceMemberRole,
    removeWorkspaceMember,
    inviteWorkspaceMember // If using thunk for invite
} from '../../redux/slices/workspaceSlice';
import { toast } from 'react-hot-toast';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog"; // Import confirmation dialog

// Receive full workspace object
const MembersList = ({ workspace }) => {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector(state => state.auth);
    // Get loading/error states specific to member actions if you added them
    // const { isUpdatingRole, isRemovingMember, memberActionError } = useSelector(state => state.workspaces);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState({ type: null, id: null }); // Local loading state for actions

    // Ensure workspace and its properties exist
    const members = workspace?.members || [];
    const workspaceId = workspace?._id;
    const isCurrentUserAdmin = workspace?.members?.find(m => m.user?._id === currentUser?._id)?.role === 'admin';
    const ownerId = workspace?.owner?._id || workspace?.owner; // Handle populated vs unpopulated owner

    const workspaceRoles = [
        { value: 'member', label: 'Member' },
        { value: 'admin', label: 'Admin' },
    ];

    if (!workspace) {
         return <p className="text-gray-400 p-4">Loading workspace data...</p>;
    }

    if (members.length === 0) {
        // Still show invite button if admin
        return (
            <div className="p-4">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-semibold">Members (0)</h3>
                     {isCurrentUserAdmin && (
                         <Button onClick={() => setIsInviteModalOpen(true)} size="sm">
                             <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                         </Button>
                     )}
                 </div>
                <p className="text-gray-400">No members in this workspace yet.</p>
                <InviteMemberModal
                    contextType="workspace"
                    contextId={workspaceId}
                    isOpen={isInviteModalOpen}
                    onClose={() => setIsInviteModalOpen(false)}
                    onInviteSuccess={() => dispatch(fetchWorkspaceDetail(workspaceId))} // Refresh on success
                    availableRoles={workspaceRoles}
                 />
            </div>
        );
    }

    const handleRoleChange = async (memberUserId, newRole) => {
        if (!workspaceId || !memberUserId) return;
        setActionLoading({ type: 'role', id: memberUserId });
        try {
            await dispatch(updateWorkspaceMemberRole({ workspaceId, memberUserId, role: newRole })).unwrap();
            toast.success('Member role updated.');
            // Thunk already updates state, but explicit fetch ensures latest data if needed
            // dispatch(fetchWorkspaceDetail(workspaceId));
        } catch (error) {
            toast.error(error || 'Failed to update role.');
            console.error("Role change error:", error);
        } finally {
            setActionLoading({ type: null, id: null });
        }
    };

    const handleRemoveMember = async (memberUserId) => {
        if (!workspaceId || !memberUserId) return;
         setActionLoading({ type: 'remove', id: memberUserId });
        try {
            await dispatch(removeWorkspaceMember({ workspaceId, memberUserId })).unwrap();
            toast.success('Member removed.');
            // Thunk already updates state, but explicit fetch ensures latest data if needed
            // dispatch(fetchWorkspaceDetail(workspaceId));
        } catch (error) {
            toast.error(error || 'Failed to remove member.');
            console.error("Remove member error:", error);
        } finally {
             setActionLoading({ type: null, id: null });
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Members ({members.length})</h3>
                {isCurrentUserAdmin && ( // Show invite button only to admins
                    <Button onClick={() => setIsInviteModalOpen(true)} size="sm">
                        <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                    </Button>
                )}
            </div>
            <div className="space-y-3">
                {members.map((member) => {
                    if (!member || !member.user) {
                        console.warn("Skipping rendering member due to missing data:", member);
                        return null;
                    }
                    const memberUserId = member.user?._id || member.user;
                    const isOwner = memberUserId === ownerId;
                    const isSelf = memberUserId === currentUser?._id;
                    const canManageMember = isCurrentUserAdmin && !isOwner && !isSelf;
                    const memberName = `${member.user?.name?.first || ''} ${member.user?.name?.last || ''}`.trim() || 'No Name';
                    const isLoadingAction = actionLoading.id === memberUserId;

                    return (
                        <Card key={member._id || memberUserId} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-white">
                            <CardContent className="flex items-center space-x-4 p-3">
                                <Avatar className="w-10 h-10">
                                    <AvatarImage src={member.user?.avatar?.url} alt={memberName} />
                                    <AvatarFallback className="bg-gray-600">{member.user?.name?.first?.charAt(0) || '?'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{memberName}</p>
                                    <p className="text-sm text-gray-400">{member.user?.email || 'No Email'}</p>
                                </div>
                                <div className="ml-auto flex items-center space-x-2">
                                     {isLoadingAction && <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> }
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${isOwner ? 'bg-yellow-600 text-white' :
                                        member.role === 'admin' ? 'bg-purple-600 text-white' :
                                            'bg-gray-600 text-gray-300'
                                        }`}>
                                        {isOwner ? 'Owner' : member.role}
                                    </span>
                                    {/* Member Actions Dropdown */}
                                    {canManageMember && !isLoadingAction && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                                                {/* Role Change Items */}
                                                {member.role === 'member' && (
                                                    <DropdownMenuItem disabled={isLoadingAction} onClick={() => handleRoleChange(memberUserId, 'admin')} className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                                                        <ShieldCheck className="mr-2 h-4 w-4 text-purple-400" /> Make Admin
                                                    </DropdownMenuItem>
                                                )}
                                                {member.role === 'admin' && (
                                                    <DropdownMenuItem disabled={isLoadingAction} onClick={() => handleRoleChange(memberUserId, 'member')} className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                                                        <Shield className="mr-2 h-4 w-4 text-gray-400" /> Make Member
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator className="bg-gray-700" />

                                                {/* Remove Member Confirmation */}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem disabled={isLoadingAction} onSelect={(e) => e.preventDefault()} className="cursor-pointer text-red-400 hover:bg-red-900/50 hover:text-red-300 focus:bg-red-900/50 focus:text-red-300">
                                                            <Trash2 className="mr-2 h-4 w-4" /> Remove Member...
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-gray-300">
                                                                This will remove {memberName} from the workspace. They will lose access immediately.
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

            {/* Invite Modal */}
            <InviteMemberModal
                contextType="workspace"
                contextId={workspaceId}
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInviteSuccess={() => dispatch(fetchWorkspaceDetail(workspaceId))} // Refresh on success
                availableRoles={workspaceRoles}
            />
        </div>
    );
};

export default MembersList;
// --- END OF FILE MembersList.jsx ---