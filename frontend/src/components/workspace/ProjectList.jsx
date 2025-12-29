import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {  useNavigate} from 'react-router-dom';
import { fetchProjects } from '../../redux/slices/projectSlice.js';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Calendar, AlertCircle, Search, Briefcase, Loader2, ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';

const ProjectList = ({ workspaceId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { projects = [], isLoading } = useSelector((state) => state.projects);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (workspaceId) {
             dispatch(fetchProjects(workspaceId));
        }
    }, [dispatch, workspaceId]);

    const handleProjectClick = (projectId) => {
        if (workspaceId && projectId) {
            const url = `/workspaces/${workspaceId}/projects/${projectId}`;
            navigate(url);
        } else {
            console.error("Cannot navigate: Missing workspaceId or projectId");
        }
    };

    const filteredProjects = (projects || []).filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'critical':
                return 'text-destructive bg-destructive/10 border-destructive/30';
            case 'high':
                return 'text-chart-5 bg-chart-5/10 border-chart-5/30';
            case 'medium':
                return 'text-chart-2 bg-chart-2/10 border-chart-2/30';
            case 'low':
                return 'text-chart-4 bg-chart-4/10 border-chart-4/30';
            default:
                return 'text-muted-foreground bg-accent/50 border-border';
        }
    };


    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading projects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6 animate-fadeInUp'>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                    type="text"
                    placeholder="Search projects by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all text-foreground placeholder:text-muted-foreground"
                />
            </div>

            {/* Project List/Grid */}
            {filteredProjects.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredProjects.map((project, index) => (
                        <Card
                            key={project._id}
                            className="group bg-card/60 backdrop-blur-sm border-2 border-border hover:border-primary/50 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-black/10 animate-fadeInUp"
                            onClick={() => handleProjectClick(project._id)}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors flex items-start justify-between">
                                    <span className="flex-1">{project.name}</span>
                                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className='text-sm text-muted-foreground line-clamp-2 h-10 leading-relaxed'>
                                    {project.description || 'No description'}
                                </p>

                                <div className='flex items-center justify-between gap-3'>
                                    {/* Due Date */}
                                    <div className='flex items-center gap-2 text-xs'>
                                        <div className="p-1.5 rounded-md bg-accent">
                                            <Calendar className='w-3.5 h-3.5 text-muted-foreground' />
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground font-medium">
                                                {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Priority Badge */}
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold capitalize ${getPriorityColor(project.priority)}`}>
                                        <AlertCircle className='w-3.5 h-3.5' />
                                        {project.priority || 'low'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16">
                    <div className="max-w-md mx-auto bg-card/50 border-2 border-dashed border-border rounded-xl p-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                            <Briefcase className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {searchQuery ? 'No projects found' : 'No projects yet'}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                            {searchQuery ? 'Try adjusting your search criteria' : 'Create your first project to get started'}
                        </p>
                    </div>
                 </div>
            )}
        </div>
    );
};

ProjectList.propTypes = {
    workspaceId: PropTypes.string.isRequired,
};

export default ProjectList;
