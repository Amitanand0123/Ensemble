import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import { fetchWorkspaceDetail } from '../../redux/slices/workspaceSlice';
import ProjectList from './ProjectList';
import MembersList from './MembersList';
import FilesList from './FilesList';
import CreateProject from '../project/CreateProject';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, MessageSquare, FileText, Plus } from 'lucide-react';
import WorkspaceSettings from './WorkspaceSettings';
import { Button } from '../ui/button';
import ChatTab from '../chat/ChatTab';

const WorkspaceDetail = () => {
    const { workspaceId } = useParams();
    const dispatch = useDispatch();
    const { workspaceDetail, isLoading } = useSelector(state => state.workspaces);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (workspaceId) {
            dispatch(fetchWorkspaceDetail(workspaceId));
        }
    }, [dispatch, workspaceId]);

    if (isLoading || !workspaceDetail || workspaceDetail._id !== workspaceId) {
        return <div className="flex justify-center items-center h-screen text-white">Loading workspace...</div>;
    }

    const isProjectRouteActive = location.pathname.includes(`/projects/`);

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-32">
            <div className="relative">
                <div className="absolute inset-0 overflow-hidden -z-10">
                    <div className="absolute -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute top-20 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <Card className='mb-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 animate-fade-in-up'>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">{workspaceDetail.name}</CardTitle>
                            <p className='text-sm text-gray-400'>{workspaceDetail.description}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <div className='flex gap-4 text-sm text-gray-400'>
                                    <div className='flex items-center'>
                                        <Users className='w-4 h-4 mr-2 text-gray-400' />
                                        {workspaceDetail.members?.length || 0} members
                                    </div>
                                    <div className='flex items-center'>
                                        <MessageSquare className='w-4 h-4 mr-2 text-gray-400' />
                                        {workspaceDetail.settings?.features?.chat ? 'Chat enabled' : 'Chat disabled'}
                                    </div>
                                    <div className='flex items-center'>
                                        <FileText className='w-4 h-4 mr-2 text-gray-400' />
                                        {workspaceDetail.settings?.features?.files ? 'Files enabled' : 'Files disabled'}
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setIsCreateProjectModalOpen(true)}
                                    className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-all duration-300 flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    New Project
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {!isProjectRouteActive ? (
                        <Tabs defaultValue="projects" className="animate-fade-in-up">
                            <TabsList className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                                <TabsTrigger value="projects">Projects</TabsTrigger>
                                <TabsTrigger value="members">Members</TabsTrigger>
                                <TabsTrigger value="files">Files</TabsTrigger>
                                <TabsTrigger value="chat">Chat</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>
                            <TabsContent value="projects">
                                <ProjectList workspaceId={workspaceId} />
                            </TabsContent>
                            <TabsContent value="members">
                                <MembersList workspace={workspaceDetail} />
                            </TabsContent>
                            <TabsContent value="files">
                                <FilesList contextType="workspace" contextId={workspaceId} />
                            </TabsContent>
                            <TabsContent value="chat">
                                <ChatTab type="workspace" id={workspaceId} />
                            </TabsContent>
                            <TabsContent value="settings">
                                <WorkspaceSettings workspaceId={workspaceId} />
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <Outlet />
                    )}
                </div>
            </div>

            {/* Use the dedicated CreateProject component as a modal */}
            <CreateProject
                workspaceId={workspaceId}
                open={isCreateProjectModalOpen}
                onOpenChange={setIsCreateProjectModalOpen}
            />
        </div>
    );
};

export default WorkspaceDetail;