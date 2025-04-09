// WorkspaceDetail.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useParams } from 'react-router-dom';
import { fetchWorkspaceDetail } from '../../redux/slices/workspaceSlice';
import ProjectList from './ProjectList';
import MembersList from './MembersList';
import FilesList from './FilesList';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, MessageSquare, FileText, X, Plus } from 'lucide-react';
import WorkspaceSettings from './WorkspaceSettings';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import axios from 'axios';
import { fetchProjects } from '../../redux/slices/projectSlice';
import { useLocation } from 'react-router-dom';
import ChatTab from '../chat/ChatTab';



const WorkspaceDetail = () => {
    const { workspaceId } = useParams();
    const dispatch = useDispatch();
    const workspaceDetail = useSelector(state => state.workspaces.workspaceDetail);
    const isLoading = useSelector(state => state.workspaces.isLoading);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false)
    const location=useLocation()

    useEffect(() => {
        if (!workspaceDetail || workspaceDetail._id !== workspaceId) {
            dispatch(fetchWorkspaceDetail(workspaceId));
        }
    }, [dispatch, workspaceId, workspaceDetail]);

    if (isLoading || !workspaceDetail) {
        return <div>Loading...</div>;
    }

    const CreateProjectModal = ({ workspaceId, isOpen, onClose }) => {
        const [projectData, setProjectData] = useState({
            name: '',
            description: '',
            priority: 'low',
            isPrivate: false,
            tags: ''
        });
        const [error, setError] = useState('');
        const [isSubmitting, setIsSubmitting] = useState(false);
        const token = useSelector((state) => state.auth.token);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            setIsSubmitting(true);

            const formattedData = {
                ...projectData,
                workspace: workspaceId,
                settings: {
                    isPrivate: projectData.isPrivate,
                    tags: projectData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
                }
            };

            try {
                const response = await axios.post('/api/projects', formattedData, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    dispatch(fetchProjects(workspaceId));
                    onClose();
                } else {
                    setError(response.data.message || 'Failed to create project');
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Error creating project.');
            } finally {
                setIsSubmitting(false);
            }
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-gray-800 rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <Button
                        className="absolute top-4 right-4"
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    <h2 className="text-2xl font-bold mb-6">Create New Project</h2>

                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Label>Project Name</Label>
                                <Input
                                    value={projectData.name}
                                    onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={projectData.description}
                                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                                    className="mt-1"
                                    rows={4}
                                />
                            </div>

                            <div>
                                <Label>Priority</Label>
                                <select
                                    value={projectData.priority}
                                    onChange={(e) => setProjectData({ ...projectData, priority: e.target.value })}
                                    className="w-full mt-1 bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    checked={projectData.isPrivate}
                                    onChange={(e) => setProjectData({ ...projectData, isPrivate: e.target.checked })}
                                    className="rounded border-gray-600"
                                />
                                <Label htmlFor="isPrivate">Private Project</Label>
                            </div>

                            <div>
                                <Label>Tags (comma-separated)</Label>
                                <Input
                                    value={projectData.tags}
                                    onChange={(e) => setProjectData({ ...projectData, tags: e.target.value })}
                                    className="mt-1"
                                    placeholder="feature, bug, enhancement"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating..." : "Create Project"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-32">
            <div className="relative">
                <div className="absolute inset-0 overflow-hidden">
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

                    {!location.pathname.includes(`/projects/`) ? (
                        <Tabs defaultValue="projects" className="animate-fade-in-up">
                            <TabsList className="bg-gray-800/50 backdrop-blur-sm border border-gray-700">
                                <TabsTrigger value="projects">Projects</TabsTrigger>
                                <TabsTrigger value="members">Members</TabsTrigger>
                                <TabsTrigger value="files">Files</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                                <TabsTrigger value="chat">Chat</TabsTrigger>
                            </TabsList>
                            <TabsContent value="projects">
                                <ProjectList workspaceId={workspaceId} />
                                <Outlet/>
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
                    ): (
                        <Outlet />
                    )}
                </div>
            </div> 

            <CreateProjectModal
                workspaceId={workspaceId}
                isOpen={isCreateProjectModalOpen}
                onClose={() => setIsCreateProjectModalOpen(false)}
            />
            {/* <ChatSidebar type="workspace" targetId={workspaceId}/> */}
        </div>
    );
};

export default WorkspaceDetail;