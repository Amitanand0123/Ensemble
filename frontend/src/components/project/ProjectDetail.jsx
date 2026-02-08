import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users,  ArrowLeft, AlertCircle, BarChart2, Loader2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchProjectDetail } from '../../redux/slices/projectSlice';
import TaskList from './TaskList';
import ProjectSettings from './ProjectSettings';
import ChatTab from '../chat/ChatTab';
import { Progress } from '@/components/ui/progress';
import FilesList from '../workspace/FilesList';
import ProjectMembers from './ProjectMembers';
import { fetchTasks } from '../../redux/slices/taskSlice';

const ProjectDetail = () => {
    const { workspaceId, projectId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { currentProject, isLoading: projectLoading, error: projectError } = useSelector((state) => state.projects);

    const { tasks, isLoading: tasksLoading } = useSelector((state) => state.task);

    useEffect(() => {
        if (projectId) {
            dispatch(fetchProjectDetail(projectId));
            dispatch(fetchTasks({ projectId }));
        }
    }, [dispatch, projectId]);

    const handleBack = () => {
        navigate(`/workspaces/${workspaceId}`);
    };

    const calculateProgress = () => {
        if (!tasks || tasks.length === 0) return 0;
        const completedTasks = tasks.filter(task => task.status === 'done').length;
        return (completedTasks / tasks.length) * 100;
    };

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

    const progressValue = calculateProgress();

    if (projectLoading || !currentProject) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading project details...</p>
                </div>
            </div>
        );
    }

    if (projectError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-6 bg-card border border-destructive/50 rounded-xl max-w-md shadow-2xl">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-destructive" />
                    <p className="text-destructive font-medium">Error loading project</p>
                    <p className="text-muted-foreground text-sm mt-2">{projectError}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="relative">
                {/* Background elements - Slack teal and green glows */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute right-0 top-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute left-0 bottom-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    {/* Back Button */}
                    <Button
                        onClick={handleBack}
                        variant="ghost"
                        className="mb-6 text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 h-auto"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Workspace
                    </Button>

                    {/* Project Header Card */}
                    <Card className="mb-8 bg-card/60 backdrop-blur-sm rounded-xl border-2 border-border shadow-lg animate-fadeInUp">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                                {currentProject?.name}
                            </CardTitle>
                            <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">
                                {currentProject?.description || 'No description provided'}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Overall Progress</span>
                                    <span className="text-foreground font-semibold text-base">{Math.round(progressValue)}%</span>
                                </div>
                                <Progress value={progressValue} className="h-3" />
                                <p className="text-xs text-muted-foreground">
                                    {tasks.filter(t => t.status === 'done').length} of {tasks.length} tasks completed
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Due Date Card */}
                                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border border-border hover:border-accent/50 transition-colors">
                                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-chart-4 to-chart-1">
                                        <Calendar className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Due Date</p>
                                        <p className="font-semibold text-foreground text-sm truncate">
                                            {currentProject?.endDate ? new Date(currentProject.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                                        </p>
                                    </div>
                                </div>

                                {/* Team Members Card */}
                                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-lg border border-border hover:border-accent/50 transition-colors">
                                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-chart-1 to-chart-2">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Team Members</p>
                                        <p className="font-semibold text-foreground text-sm">{currentProject?.members?.length || 0}</p>
                                    </div>
                                </div>

                                {/* Priority Card */}
                                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-lg border border-border hover:border-accent/50 transition-colors">
                                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-chart-5 to-chart-4">
                                        <AlertCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Priority</p>
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-semibold capitalize ${getPriorityColor(currentProject?.priority)}`}>
                                            {currentProject?.priority || 'None'}
                                        </div>
                                    </div>
                                </div>

                                {/* Total Tasks Card */}
                                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-secondary/10 to-accent/10 rounded-lg border border-border hover:border-accent/50 transition-colors">
                                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-chart-2 to-chart-3">
                                        <BarChart2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground font-medium mb-0.5">Total Tasks</p>
                                        <p className="font-semibold text-foreground text-sm">
                                            {tasksLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : tasks.length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabs Section */}
                    <Tabs defaultValue="tasks" className="animate-fadeInUp">
                        <TabsList className="bg-card/60 backdrop-blur-sm border-2 border-border p-1 rounded-lg mb-6 w-full sm:w-auto grid grid-cols-5 sm:inline-grid">
                            <TabsTrigger
                                value="tasks"
                                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-all text-xs sm:text-sm px-2 sm:px-4"
                            >
                                Tasks
                            </TabsTrigger>
                            <TabsTrigger
                                value="members"
                                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-all text-xs sm:text-sm px-2 sm:px-4"
                            >
                                Members
                            </TabsTrigger>
                            <TabsTrigger
                                value="files"
                                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-all text-xs sm:text-sm px-2 sm:px-4"
                            >
                                Files
                            </TabsTrigger>
                            <TabsTrigger
                                value="settings"
                                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-all text-xs sm:text-sm px-2 sm:px-4"
                            >
                                <Settings className="w-4 h-4 sm:hidden" />
                                <span className="hidden sm:inline">Settings</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="chat"
                                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-md transition-all text-xs sm:text-sm px-2 sm:px-4"
                            >
                                Chat
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="tasks" className="mt-6">
                            <TaskList projectId={projectId} workspaceId={workspaceId} />
                        </TabsContent>
                        <TabsContent value="members" className="mt-6">
                            <ProjectMembers project={currentProject} />
                        </TabsContent>
                        <TabsContent value="files" className="mt-6">
                            <FilesList contextType="project" contextId={projectId} />
                        </TabsContent>
                        <TabsContent value="settings" className="mt-6">
                            <ProjectSettings project={currentProject} />
                        </TabsContent>
                        <TabsContent value="chat" className="mt-6">
                            <ChatTab type="project" id={projectId} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
