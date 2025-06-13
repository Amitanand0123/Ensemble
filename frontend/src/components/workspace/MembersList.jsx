import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { MoreVertical, UserPlus, ShieldCheck, Shield, Trash2, Loader2 } from 'lucide-react';
import InviteMemberModal from './InviteMemberModal';
import {
    fetchWorkspaceDetail,
    updateWorkspaceMemberRole,
    removeWorkspaceMember,
} from '../../redux/slices/workspaceSlice';
import { toast } from 'react-hot-toast';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import PropTypes from 'prop-types';

const MembersList = ({ workspace }) => {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector(state => state.auth);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState({ type: null, id: null });

    const members = workspace?.members || [];
    const workspaceId = workspace?._id;
    const isCurrentUserAdmin = members?.some(m => m.user?._id === currentUser?._id && m.role === 'admin');
    const ownerId = workspace?.owner?._id || workspace?.owner;

    const workspaceRoles = [
        { value: 'member', label: 'Member' },
        { value: 'admin', label: 'Admin' },
    ];

    if (!workspace) {
         return <p className="text-gray-400 p-4">Loading workspace data...</p>;
    }

    const handleRoleChange = async (memberUserId, newRole) => {
        if (!workspaceId || !memberUserId) return;
        setActionLoading({ type: 'role', id: memberUserId });
        try {
            await dispatch(updateWorkspaceMemberRole({ workspaceId, memberUserId, role: newRole })).unwrap();
            toast.success('Member role updated.');
        } catch (error) {
            toast.error(error?.message || 'Failed to update role.');
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
        } catch (error) {
            toast.error(error?.message || 'Failed to remove member.');
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
                <h3 className="text-xl font-semibold">Members ({members.length})</h3>
                {isCurrentUserAdmin && (
                    <Button onClick={() => setIsInviteModalOpen(true)} size="sm">
                        <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                    </Button>
                )}
            </div>
            <div className="space-y-3">
                {members.map((member) => {
                    if (!member?.user?._id) return null;

                    const memberUserId = member.user._id;
                    const isOwner = memberUserId === ownerId;
                    const isSelf = memberUserId === currentUser?._id;
                    const canManageMember = isCurrentUserAdmin && !isOwner && !isSelf;
                    const memberName = `${member.user.name?.first || ''} ${member.user.name?.last || ''}`.trim() || 'Unnamed User';
                    const isLoadingAction = actionLoading.id === memberUserId;

                    return (
                        <Card key={memberUserId} className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-white">
                            <CardContent className="flex items-center space-x-4 p-3">
                                <Link to={`/profile/${memberUserId}`}>
                                    <Avatar className="w-10 h-10 hover:opacity-80 transition-opacity">
                                        <AvatarImage src={member.user.avatar?.url} alt={memberName} />
                                        <AvatarFallback className="bg-gray-600">
                                            {getInitials(member.user.name?.first, member.user.name?.last)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <Link to={`/profile/${memberUserId}`} className="font-semibold hover:underline">
                                        {memberName}
                                    </Link>
                                    <p className="text-sm text-gray-400">{member.user.email || 'No Email'}</p>
                                </div>
                                <div className="ml-auto flex items-center space-x-2">
                                     {isLoadingAction && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${
                                        isOwner ? 'bg-yellow-600' :
                                        member.role === 'admin' ? 'bg-purple-600' :
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
                                                {member.role === 'member' ? (
                                                    <DropdownMenuItem onClick={() => handleRoleChange(memberUserId, 'admin')} className="cursor-pointer hover:bg-gray-700">
                                                        <ShieldCheck className="mr-2 h-4 w-4 text-purple-400" /> Make Admin
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleRoleChange(memberUserId, 'member')} className="cursor-pointer hover:bg-gray-700">
                                                        <Shield className="mr-2 h-4 w-4 text-gray-400" /> Make Member
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator className="bg-gray-700" />
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-red-400 hover:bg-red-900/50">
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

            <InviteMemberModal
                contextType="workspace"
                contextId={workspaceId}
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInviteSuccess={() => dispatch(fetchWorkspaceDetail(workspaceId))}
                availableRoles={workspaceRoles}
            />
        </div>
    );
};

MembersList.propTypes={
    workspace:PropTypes.object
}

export default MembersList;