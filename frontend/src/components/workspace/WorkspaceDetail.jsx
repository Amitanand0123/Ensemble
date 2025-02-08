import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchWorkspaceDetail } from '../../redux/slices/workspaceSlice';
import ProjectList from './ProjectList';
import MembersList from './MembersList'; // Assuming you have MembersList component
import FilesList from './FilesList';     // Assuming you have FilesList component
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, MessageSquare, FileText } from 'lucide-react';
import WorkspaceSettings from './WorkspaceSettings';

const WorkspaceDetail = () => {
    console.log("WorkspaceDetail - useParams():", useParams());
    const { workspaceId } = useParams();
    const dispatch = useDispatch();
    const workspaceDetail = useSelector(state => state.workspaces.workspaceDetail);
    const isLoading = useSelector(state => state.workspaces.isLoading);

    useEffect(() => {
        console.log("WorkspaceDetail useEffect: Component mounted, workspaceId from useParams INSIDE EFFECT:", workspaceId);
        console.log("WorkspaceDetail useEffect: workspaceDetail before fetch:", workspaceDetail);

        if (!workspaceDetail || workspaceDetail._id !== workspaceId) {
            console.log("WorkspaceDetail useEffect: Workspace not found in state, fetching detail for ID:", workspaceId);
            dispatch(fetchWorkspaceDetail(workspaceId));
        } else {
            console.log("WorkspaceDetail useEffect: Workspace detail already in state:", workspaceDetail);
        }
    }, [dispatch, workspaceId, workspaceDetail]);

    if (isLoading || !workspaceDetail) {
        console.log("WorkspaceDetail: Rendering Loading... (isLoading:", isLoading, ", workspaceDetail:", workspaceDetail, ")");
        return <div>Loading...</div>;
    }

    console.log("WorkspaceDetail: Rendering workspace details:", workspaceDetail);

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-32"> {/* Outer container with background and padding */}
            <div className="relative"> {/* Relative container for absolute positioned circles */}
                <div className="absolute inset-0 overflow-hidden"> {/* Overflow hidden for circles */}
                    <div className="absolute -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" /> {/* Purple circle */}
                    <div className="absolute top-20 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500" /> {/* Blue circle */}
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"> {/* Content container */}
                    <Card className='mb-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 animate-fade-in-up'> {/* Card styling similar to WorkspaceDashboard */}
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">{workspaceDetail.name}</CardTitle> {/* Title style */}
                            <p className='text-sm text-gray-400'>{workspaceDetail.description}</p> {/* Description color */}
                        </CardHeader>
                        <CardContent>
                            <div className='flex gap-4 text-sm text-gray-400'> {/* Content text color */}
                                <div className='flex items-center'>
                                    <Users className='w-4 h-4 mr-2 text-gray-400' /> {/* Icon color */}
                                    {workspaceDetail.members?.length || 0} members
                                </div>
                                <div className='flex items-center'>
                                    <MessageSquare className='w-4 h-4 mr-2 text-gray-400' /> {/* Icon color */}
                                    {workspaceDetail.settings?.features?.chat ? 'Chat enabled' : 'Chat disabled'}
                                </div>
                                <div className='flex items-center'>
                                    <FileText className='w-4 h-4 mr-2 text-gray-400' /> {/* Icon color */}
                                    {workspaceDetail.settings?.features?.files ? 'Files enabled' : 'Files disabled'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="projects" className="animate-fade-in-up"> {/* Tabs with animation */}
                        <TabsList className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700"> {/* TabsList style */}
                            <TabsTrigger value="projects" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-md">Projects</TabsTrigger> {/* TabsTrigger style */}
                            <TabsTrigger value="members" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-md">Members</TabsTrigger> {/* TabsTrigger style */}
                            <TabsTrigger value="files" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-md">Files</TabsTrigger> {/* TabsTrigger style */}
                            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white rounded-md">Settings</TabsTrigger> {/* TabsTrigger style */}
                        </TabsList>
                        <TabsContent value="projects" className="mt-4">
                            <ProjectList workspaceId={workspaceId} />
                        </TabsContent>
                        <TabsContent value="members" className="mt-4">
                            <MembersList members={workspaceDetail.members || []} />
                        </TabsContent>
                        <TabsContent value="files" className="mt-4">
                            <FilesList workspaceId={workspaceId} />
                        </TabsContent>
                        <TabsContent value="settings" className="mt-4">
                            <WorkspaceSettings workspaceId={workspaceId} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default WorkspaceDetail;