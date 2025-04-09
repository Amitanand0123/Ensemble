// --- START OF FILE frontend/src/components/workspace/ProjectList.jsx ---

import React, { useEffect, useState } from 'react'; // Added useState
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchProjects } from '../../redux/slices/projectSlice.js';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input'; // Import Input
import { Calendar, AlertCircle, Search, Briefcase } from 'lucide-react'; // Import Search icon

const ProjectList = ({ workspaceId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { projects = [], isLoading } = useSelector((state) => state.projects); // Default projects to []
    const [searchQuery, setSearchQuery] = useState(''); // State for search query

    useEffect(() => {
        if (workspaceId) { // Ensure workspaceId is present
             dispatch(fetchProjects(workspaceId));
        }
    }, [dispatch, workspaceId]);

    const handleProjectClick = (projectId) => {
        if (workspaceId && projectId) { // Ensure both IDs are present
            const url = `/workspaces/${workspaceId}/projects/${projectId}`;
            console.log('Navigating to project:', url);
            navigate(url);
        } else {
            console.error("Cannot navigate: Missing workspaceId or projectId");
        }
    };

    // Filter projects based on search query (name or description)
    const filteredProjects = (projects || []).filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );


    if (isLoading) return <div className="text-gray-400 p-4">Loading projects...</div>;

    return (
        <div className='space-y-4 animate-fade-in-up'>
            {/* Search Input */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    type="text"
                    placeholder="Search projects by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                />
            </div>

            {/* Project List/Grid */}
            {filteredProjects.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProjects.map((project) => (
                        <Card
                            key={project._id}
                            className="bg-gray-800/60 border border-gray-700 text-white hover:border-purple-500 cursor-pointer transition-all duration-200 hover:shadow-lg"
                            onClick={() => handleProjectClick(project._id)}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-purple-400 hover:text-purple-300 transition-colors">
                                    {project.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-sm text-gray-400 mb-4 line-clamp-2 h-10'>{project.description || 'No description'}</p> {/* Fixed height */}
                                <div className='flex justify-between text-xs text-gray-500'>
                                    <div className='flex items-center gap-1'>
                                        <Calendar className='w-3 h-3' />
                                        Due: {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                    <div className='flex items-center gap-1 capitalize'>
                                        <AlertCircle className={`w-3 h-3 ${project.priority === 'high' || project.priority === 'critical' ? 'text-red-400' : project.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'}`} />
                                        {project.priority}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-10 text-gray-500">
                    <Briefcase className="mx-auto h-10 w-10 mb-3" />
                    {searchQuery ? 'No projects found matching your search.' : 'No projects found in this workspace yet.'}
                 </div>
            )}
        </div>
    );
};

export default ProjectList;
// --- END OF FILE frontend/src/components/workspace/ProjectList.jsx ---