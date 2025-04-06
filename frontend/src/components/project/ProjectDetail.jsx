import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Clock, ArrowLeft, AlertCircle, BarChart2, MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchProjectDetail } from '../../redux/slices/projectSlice';
import TaskList from './TaskList';
// import FilesList from './FilesList';
import ProjectSettings from './ProjectSettings';
import ChatTab from '../chat/ChatTab';
import { Progress } from '@/components/ui/progress';
import FilesList from '../workspace/FilesList';
import ProjectMembers from './ProjectMembers';

const ProjectDetail = () => {
    const { workspaceId, projectId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentProject, isLoading, error } = useSelector((state) => state.projects);

    useEffect(() => {
        if (projectId) {
            dispatch(fetchProjectDetail(projectId));
        }
    }, [dispatch, projectId]);

    const handleBack = () => {
        navigate(`/workspaces/${workspaceId}`);
    };

    const calculateProgress = () => {
        const totalTasks = currentProject?.tasks?.length || 0;
        const completedTasks = currentProject?.tasks?.filter(task => task.status === 'completed').length || 0;
        return totalTasks ? (completedTasks / totalTasks) * 100 : 0;
    };

    if (isLoading || !currentProject) {
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

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-32">
            <div className="relative">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-20 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <Button
                        onClick={handleBack}
                        variant="ghost"
                        className="mb-6 text-gray-400 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Workspace
                    </Button>

                    <Card className="mb-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">{currentProject?.name}</CardTitle>
                            <p className="text-sm text-gray-400">{currentProject?.description}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Progress</span>
                                        <span className="text-gray-400">{Math.round(calculateProgress())}%</span>
                                    </div>
                                    <Progress value={calculateProgress()} className="h-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Card className="bg-gray-800/30 border-gray-700">
                                        <CardContent className="flex items-center p-4">
                                            <Calendar className="w-5 h-5 mr-3 text-purple-500" />
                                            <div>
                                                <p className="text-sm text-gray-400">Due Date</p>
                                                <p className="font-medium">
                                                    {currentProject?.endDate ? new Date(currentProject.endDate).toLocaleDateString() : 'Not set'}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gray-800/30 border-gray-700">
                                        <CardContent className="flex items-center p-4">
                                            <Users className="w-5 h-5 mr-3 text-blue-500" />
                                            <div>
                                                <p className="text-sm text-gray-400">Team Members</p>
                                                <p className="font-medium">{currentProject?.members?.length || 0}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gray-800/30 border-gray-700">
                                        <CardContent className="flex items-center p-4">
                                            <Clock className="w-5 h-5 mr-3 text-green-500" />
                                            <div>
                                                <p className="text-sm text-gray-400">Priority</p>
                                                <p className="font-medium capitalize">{currentProject?.priority || 'None'}</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-gray-800/30 border-gray-700">
                                        <CardContent className="flex items-center p-4">
                                            <BarChart2 className="w-5 h-5 mr-3 text-orange-500" />
                                            <div>
                                                <p className="text-sm text-gray-400">Total Tasks</p>
                                                <p className="font-medium">{currentProject?.tasks?.length || 0}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="tasks" className="animate-fade-in-up">
                        <TabsList className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                            <TabsTrigger value="tasks">Tasks</TabsTrigger>
                            <TabsTrigger value="members">Members</TabsTrigger>
                            <TabsTrigger value="files">Files</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                            <TabsTrigger value="chat">Chat</TabsTrigger>
                        </TabsList>

                        <TabsContent value="tasks">
                            <TaskList projectId={projectId} workspaceId={workspaceId} />
                        </TabsContent>
                        <TabsContent value="members">
                            <ProjectMembers project={currentProject} />
                        </TabsContent>

                        <TabsContent value="files">
                            <FilesList contextType="project" contextId={projectId} />
                        </TabsContent>

                        <TabsContent value="settings">
                            <ProjectSettings project={currentProject} />
                        </TabsContent>

                        <TabsContent value="chat">
                            <ChatTab type="project" id={projectId} />
                        </TabsContent>
                    </Tabs>
                </div> 
            </div>
        </div>
    );
};

export default ProjectDetail;