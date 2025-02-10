// ProjectDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Users, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { fetchProjectDetail } from '../../redux/slices/projectSlice';

const ProjectDetail = () => {
    const { workspaceId, projectId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentProject, isLoading, error } = useSelector((state) => state.projects);

    useEffect(() => {
        console.log('ProjectDetail mounting with projectId:', projectId);
        if (projectId) {
            dispatch(fetchProjectDetail(projectId));
        }
    }, [dispatch, projectId]);

    const handleBack = () => {
        navigate(`/workspaces/${workspaceId}`);
    };

    const getTabValue = () => {
        if (location.pathname.includes('/board')) return 'board';
        if (location.pathname.includes('/settings')) return 'settings';
        return 'details';
    };

    const handleTabChange = (value) => {
        switch (value) {
            case 'board':
                navigate(`/workspaces/${workspaceId}/projects/${projectId}/board`);
                break;
            case 'settings':
                navigate(`/workspaces/${workspaceId}/projects/${projectId}/settings`);
                break;
            default:
                navigate(`/workspaces/${workspaceId}/projects/${projectId}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <p className="text-gray-400">Loading project details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center p-8 text-red-500">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>Error loading project: {error.message}</p>
            </div>
        );
    }

    if (!currentProject) {
        return (
            <div className="flex items-center p-8 text-gray-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>Project not found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Button
                onClick={handleBack}
                variant="ghost"
                className="mb-4 text-gray-400 hover:text-white"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Workspace
            </Button>

            <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">{currentProject.name}</CardTitle>
                    <p className="text-gray-400">{currentProject.description}</p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Due: {new Date(currentProject.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {currentProject.members?.length || 0} members
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Priority: {currentProject.priority}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs value={getTabValue()} onValueChange={handleTabChange}>
                <TabsList className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="board">Board</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <Card>
                        <CardContent>
                            <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-medium">Project Details</h3>
                                <div className="grid gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-400">Description</h4>
                                        <p className="mt-1">{currentProject.description}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-400">Status</h4>
                                        <p className="mt-1 capitalize">{currentProject.status}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-400">Created</h4>
                                        <p className="mt-1">
                                            {new Date(currentProject.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="board">
                    <Card>
                        <CardContent>
                            <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-medium">Project Board</h3>
                                {/* Add your board content here */}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardContent>
                            <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-medium">Project Settings</h3>
                                {/* Add your settings content here */}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProjectDetail;