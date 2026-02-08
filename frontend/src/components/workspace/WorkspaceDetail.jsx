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
import { Users, Plus, Settings, Loader2 } from 'lucide-react';
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
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading workspace...</p>
                </div>
            </div>
        );
    }

    const isProjectRouteActive = location.pathname.includes(`/projects/`);

    return (
        <div className="min-h-screen bg-background">
            <div className="relative">
                {/* Background elements - Slack teal and green glows */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute right-0 top-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute left-0 bottom-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    {/* Workspace Header Card */}
                    <Card className='mb-8 bg-card/60 backdrop-blur-sm rounded-xl border-2 border-border shadow-lg animate-fadeInUp'>
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                <div className="flex-1">
                                    <CardTitle className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                                        {workspaceDetail.name}
                                    </CardTitle>
                                    <p className='text-sm lg:text-base text-muted-foreground leading-relaxed'>
                                        {workspaceDetail.description || 'No description provided'}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setIsCreateProjectModalOpen(true)}
                                    className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 self-start"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">New Project</span>
                                    <span className="sm:hidden">New</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className='flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-border max-w-xs'>
                                <div className="p-2 rounded-md bg-primary">
                                    <Users className='w-5 h-5 text-primary-foreground' />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Members</p>
                                    <p className="text-lg font-semibold text-foreground">{workspaceDetail.members?.length || 0}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {!isProjectRouteActive ? (
                        <Tabs defaultValue="projects" className="animate-fadeInUp">
                            <TabsList className="bg-card/60 backdrop-blur-sm border-2 border-border p-1 rounded-lg mb-6 w-full sm:w-auto grid grid-cols-5 sm:inline-grid">
                                <TabsTrigger
                                    value="projects"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all text-xs sm:text-sm px-2 sm:px-4"
                                >
                                    Projects
                                </TabsTrigger>
                                <TabsTrigger
                                    value="members"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all text-xs sm:text-sm px-2 sm:px-4"
                                >
                                    Members
                                </TabsTrigger>
                                <TabsTrigger
                                    value="files"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all text-xs sm:text-sm px-2 sm:px-4"
                                >
                                    Files
                                </TabsTrigger>
                                <TabsTrigger
                                    value="chat"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all text-xs sm:text-sm px-2 sm:px-4"
                                >
                                    Chat
                                </TabsTrigger>
                                <TabsTrigger
                                    value="settings"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all text-xs sm:text-sm px-2 sm:px-4"
                                >
                                    <Settings className="w-4 h-4 sm:hidden" />
                                    <span className="hidden sm:inline">Settings</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="projects" className="mt-6">
                                <ProjectList workspaceId={workspaceId} />
                            </TabsContent>
                            <TabsContent value="members" className="mt-6">
                                <MembersList workspace={workspaceDetail} />
                            </TabsContent>
                            <TabsContent value="files" className="mt-6">
                                <FilesList contextType="workspace" contextId={workspaceId} />
                            </TabsContent>
                            <TabsContent value="chat" className="mt-6">
                                <ChatTab type="workspace" id={workspaceId} />
                            </TabsContent>
                            <TabsContent value="settings" className="mt-6">
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
