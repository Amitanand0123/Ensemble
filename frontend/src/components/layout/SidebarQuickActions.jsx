import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, LogIn, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import CreateWorkspaceModal from '../workspace/CreateWorkspaceModal';
import JoinWorkspaceModal from '../workspace/JoinWorkspaceModal';
import CreateProject from '../project/CreateProject';

const SidebarQuickActions = () => {
    const { isAdmin } = useSelector(state => state.auth);
    const { workspaceId } = useParams();

    const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
    const [isJoinWorkspaceModalOpen, setIsJoinWorkspaceModalOpen] = useState(false);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);

    return (
        <>
            <div className="space-y-2">
                {/* Create Project - show when in workspace context */}
                {workspaceId && (
                    <button
                        onClick={() => setIsCreateProjectModalOpen(true)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-text hover:bg-sidebar-hover transition-colors sidebar-item-transition"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create Project</span>
                    </button>
                )}

                {/* Join Workspace - available to all */}
                <button
                    onClick={() => setIsJoinWorkspaceModalOpen(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-text hover:bg-sidebar-hover transition-colors sidebar-item-transition"
                >
                    <LogIn className="w-4 h-4" />
                    <span>Join Workspace</span>
                </button>

                {/* Create Workspace - admin only */}
                {isAdmin && (
                    <button
                        onClick={() => setIsCreateWorkspaceModalOpen(true)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-text hover:bg-sidebar-hover transition-colors sidebar-item-transition"
                    >
                        <Users className="w-4 h-4" />
                        <span>Create Workspace</span>
                    </button>
                )}
            </div>

            {/* Modals */}
            <CreateWorkspaceModal
                isOpen={isCreateWorkspaceModalOpen}
                onClose={() => setIsCreateWorkspaceModalOpen(false)}
            />
            <JoinWorkspaceModal
                isOpen={isJoinWorkspaceModalOpen}
                onClose={() => setIsJoinWorkspaceModalOpen(false)}
            />
            {workspaceId && (
                <CreateProject
                    workspaceId={workspaceId}
                    open={isCreateProjectModalOpen}
                    onOpenChange={setIsCreateProjectModalOpen}
                />
            )}
        </>
    );
};

export default SidebarQuickActions;
