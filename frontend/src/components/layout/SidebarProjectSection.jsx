import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Hash } from 'lucide-react';
import { fetchProjects } from '../../redux/slices/projectSlice';
import PropTypes from 'prop-types';

const SidebarProjectSection = ({ collapsedSections, toggleSection, currentPath, onNavigate }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { workspaceId } = useParams();
    const { workspaces } = useSelector(state => state.workspaces);
    const { projects } = useSelector(state => state.projects);

    useEffect(() => {
        if (workspaceId) {
            dispatch(fetchProjects(workspaceId));
        }
    }, [workspaceId, dispatch]);

    const workspacesToShow = workspaceId
        ? workspaces.filter(w => w._id === workspaceId)
        : workspaces;

    const handleProjectClick = (workspaceId, projectId) => {
        navigate(`/workspaces/${workspaceId}/projects/${projectId}`);
        if (onNavigate) onNavigate();
    };

    if (workspacesToShow.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="px-3 py-1">
                <h3 className="text-xs font-semibold text-sidebar-textMuted uppercase tracking-wider">
                    Projects
                </h3>
            </div>

            {workspacesToShow.map(workspace => {
                const workspaceProjects = projects.filter(p => p.workspace === workspace._id);
                const isCollapsed = collapsedSections[workspace._id];
                const hasProjects = workspaceProjects.length > 0;

                return (
                    <div key={workspace._id} className="space-y-1">
                        {/* Workspace header with chevron */}
                        {!workspaceId && hasProjects && (
                            <button
                                onClick={() => toggleSection(workspace._id)}
                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-sidebar-textMuted hover:bg-sidebar-hover transition-colors"
                            >
                                <ChevronRight
                                    className={`w-3 h-3 transition-transform ${
                                        isCollapsed ? '' : 'rotate-90'
                                    }`}
                                />
                                <span className="truncate">{workspace.name}</span>
                                <span className="ml-auto text-xs">{workspaceProjects.length}</span>
                            </button>
                        )}

                        {/* Project list */}
                        {(!isCollapsed || workspaceId) && hasProjects && (
                            <div className={!workspaceId ? "ml-2" : ""}>
                                {workspaceProjects.map(project => {
                                    const isActive = currentPath.includes(`/projects/${project._id}`);
                                    return (
                                        <button
                                            key={project._id}
                                            onClick={() => handleProjectClick(workspace._id, project._id)}
                                            className={`
                                                w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                                                transition-colors sidebar-item-transition
                                                ${isActive
                                                    ? 'bg-sidebar-active text-sidebar-text font-medium'
                                                    : 'text-sidebar-textMuted hover:bg-sidebar-hover hover:text-sidebar-text'
                                                }
                                            `}
                                        >
                                            <Hash className="w-4 h-4 flex-shrink-0" />
                                            <span className="truncate flex-1 text-left">{project.name}</span>
                                            {/* Unread badge placeholder - can be connected to actual unread count */}
                                            {project.unreadCount > 0 && (
                                                <span className="unread-badge">
                                                    {project.unreadCount}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* No projects message */}
                        {!hasProjects && workspaceId && (
                            <p className="px-3 py-2 text-xs text-sidebar-textMuted italic">
                                No projects yet
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

SidebarProjectSection.propTypes = {
    collapsedSections: PropTypes.object.isRequired,
    toggleSection: PropTypes.func.isRequired,
    currentPath: PropTypes.string.isRequired,
    onNavigate: PropTypes.func
};

export default SidebarProjectSection;
