import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, LayoutDashboard } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SidebarHeader = () => {
    const navigate = useNavigate();
    const { workspaceId } = useParams();
    const { workspaces } = useSelector(state => state.workspaces);
    const [currentWorkspace, setCurrentWorkspace] = useState(null);

    useEffect(() => {
        if (workspaceId && workspaces.length > 0) {
            const workspace = workspaces.find(w => w._id === workspaceId);
            setCurrentWorkspace(workspace);
        } else {
            setCurrentWorkspace(null);
        }
    }, [workspaceId, workspaces]);

    return (
        <div className="p-4 border-b border-sidebar-hover">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-hover transition-colors text-sidebar-text">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-accent flex-shrink-0 flex items-center justify-center">
                                {currentWorkspace ? (
                                    <span className="text-sm font-bold text-accent-foreground">
                                        {currentWorkspace.name.charAt(0).toUpperCase()}
                                    </span>
                                ) : (
                                    <LayoutDashboard className="w-4 h-4 text-accent-foreground" />
                                )}
                            </div>
                            <div className="text-left min-w-0 flex-1">
                                <p className="text-sm font-semibold truncate text-sidebar-text">
                                    {currentWorkspace?.name || 'All Workspaces'}
                                </p>
                                <p className="text-xs text-sidebar-textMuted truncate">
                                    {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-sidebar-textMuted flex-shrink-0" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border">
                    <DropdownMenuItem
                        onClick={() => navigate('/dashboard')}
                        className="cursor-pointer hover:bg-accent"
                    >
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        <span>All Workspaces</span>
                    </DropdownMenuItem>
                    {workspaces.map(workspace => (
                        <DropdownMenuItem
                            key={workspace._id}
                            onClick={() => navigate(`/workspaces/${workspace._id}`)}
                            className="cursor-pointer hover:bg-accent"
                        >
                            <div className="w-4 h-4 rounded mr-2 bg-chart-1 flex items-center justify-center text-xs font-bold">
                                {workspace.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{workspace.name}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default SidebarHeader;
