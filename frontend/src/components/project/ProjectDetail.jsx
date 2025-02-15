// ProjectDetail.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, Users, Clock, ArrowLeft, AlertCircle, BarChart2 } from 'lucide-react';
import { Button } from '../ui/button';
import { fetchProjectDetail } from '../../redux/slices/projectSlice';
import ProjectHeader from './ProjectHeader';
import TaskList from './TaskList';
import TaskBoard from './TaskBoard';
import ProjectMembers from './ProjectMembers';
import ProjectSettings from './ProjectSettings';
import { Progress } from '../ui/progress';

const ProjectDetail = () => {
    const { workspaceId, projectId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentProject, isLoading, error } = useSelector((state) => state.projects);

    useEffect(() => {
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
        if (location.pathname.includes('/members')) return 'members';
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
            case 'members':
                navigate(`/workspaces/${workspaceId}/projects/${projectId}/members`);
                break;
            default:
                navigate(`/workspaces/${workspaceId}/projects/${projectId}`);
        }
    };

    const calculateProgress = () => {
        const totalTasks = currentProject.tasks?.length || 0;
        const completedTasks = currentProject.tasks?.filter(task => task.status === 'completed').length || 0;
        return totalTasks ? (completedTasks / totalTasks) * 100 : 0;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-pulse text-gray-400">Loading project details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen text-red-500">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>Error loading project: {error.message}</p>
            </div>
        );
    }

    if (!currentProject) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p>Project not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 pt-40">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Button
                        onClick={handleBack}
                        variant="ghost"
                        className="text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Workspace
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Project Overview Card */}
                    <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">{currentProject.name}</CardTitle>
                            <p className="text-gray-400">{currentProject.description}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Progress</span>
                                        <span className="text-gray-400">{Math.round(calculateProgress())}%</span>
                                    </div>
                                    <Progress value={calculateProgress()} className="h-2" />
                                </div>

                                {/* Project Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card className="bg-gray-800/30 border-gray-700">
                                        <CardContent className="flex items-center p-4">
                                            <Calendar className="w-5 h-5 mr-3 text-purple-500" />
                                            <div>
                                                <p className="text-sm text-gray-400">Due Date</p>
                                                <p className="font-medium">
                                                    {currentProject.endDate ? new Date(currentProject.endDate).toLocaleDateString() : 'Not set'}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gray-800/30 border-gray-700">
                                        <CardContent className="flex items-center p-4">
                                            <Users className="w-5 h-5 mr-3 text-blue-500" />
                                            <div>
                                                <p className="text-sm text-gray-400">Team Members</p>
                                                <p className="font-medium">{currentProject.members?.length || 0}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gray-800/30 border-gray-700">
                                        <CardContent className="flex items-center p-4">
                                            <Clock className="w-5 h-5 mr-3 text-green-500" />
                                            <div>
                                                <p className="text-sm text-gray-400">Priority</p>
                                                <p className="font-medium capitalize">{currentProject.priority || 'None'}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gray-800/30 border-gray-700">
                                        <CardContent className="flex items-center p-4">
                                            <BarChart2 className="w-5 h-5 mr-3 text-orange-500" />
                                            <div>
                                                <p className="text-sm text-gray-400">Total Tasks</p>
                                                <p className="font-medium">{currentProject.tasks?.length || 0}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs Section */}
                    <Tabs value={getTabValue()} onValueChange={handleTabChange} className="space-y-4">
                        <TabsList className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 w-full justify-start">
                            <TabsTrigger value="details" className="flex-1 max-w-[200px]">Details</TabsTrigger>
                            <TabsTrigger value="board" className="flex-1 max-w-[200px]">Board</TabsTrigger>
                            <TabsTrigger value="members" className="flex-1 max-w-[200px]">Members</TabsTrigger>
                            <TabsTrigger value="settings" className="flex-1 max-w-[200px]">Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details">
                            <Card className="bg-gray-800/30 border-gray-700">
                                <CardContent className="p-6">
                                    <TaskList projectId={projectId} workspaceId={workspaceId} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="board">
                            <Card className="bg-gray-800/30 border-gray-700">
                                <CardContent className="p-6">
                                    <TaskBoard projectId={projectId} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="members">
                            <Card className="bg-gray-800/30 border-gray-700">
                                <CardContent className="p-6">
                                    <ProjectMembers project={currentProject} />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="settings">
                            <Card className="bg-gray-800/30 border-gray-700">
                                <CardContent className="p-6">
                                    <ProjectSettings project={currentProject} />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;