import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchProjects } from '../../redux/slices/projectSlice.js';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Calendar, AlertCircle } from 'lucide-react';

const ProjectList = ({workspaceId}) => {
    // const { workspaceId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { projects, isLoading } = useSelector((state) => state.projects);

    useEffect(() => {
        dispatch(fetchProjects(workspaceId));
    }, [dispatch, workspaceId]);

    const handleProjectClick = (projectId) => {
        console.log('Project clicked:', projectId);
        console.log('Current workspaceId:', workspaceId);
        const url = `/workspaces/${workspaceId}/projects/${projectId}`;
        console.log('Navigating to:', url);
        navigate(url);
    };

    if (isLoading) return <div>Loading projects...</div>;

    return (
        <div className='space-y-4'>
            <div className='flex justify-between items-center'>
                <h3 className='text-xl font-semibold'>Projects</h3>
            </div>
            <div className="grid gap-4">
                {Array.isArray(projects) && projects.map((project) => (
                    <Card 
                        key={project._id}
                        className="hover:bg-gray-800/50 cursor-pointer transition-all duration-200"
                        onClick={() => handleProjectClick(project._id)}
                    >
                        <CardHeader>
                            <CardTitle className="text-lg text-blue-400 hover:text-blue-300">
                                {project.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='text-sm text-gray-400 mb-4'>{project.description}</p>
                            <div className='flex justify-between text-sm text-gray-500'>
                                <div className='flex items-center'>
                                    <Calendar className='w-4 h-4 mr-2' />
                                    {new Date(project.endDate).toLocaleDateString()}
                                </div>
                                <div className='flex items-center'>
                                    <AlertCircle className='w-4 h-4 mr-2' />
                                    {project.priority}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ProjectList;