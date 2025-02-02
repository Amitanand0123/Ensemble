import React,{useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'
import { fetchWorkspaces } from '../../redux/slices/workspaceSlice';
import ProjectList fromm './ProjectList';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, FileText } from 'lucide-react';


const WorkspaceDetail=()=>{
    const {id}=useParams();
    const dispatch=useDispatch()
    const workspace=useSelector(state=>state.workspaces.workspaces.find(w=>w._id===id))

    useEffect(()=>{
        if(!workspace){
            dispatch(fetchWorkspaces())
        }
    },[dispatch,workspace])

    if(!workspace) return <div>Loading...</div>

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>{workspace.name}</CardTitle>
                    <p className='text-sm text-gray-600'>{workspace.description}</p>
                </CardHeader>
                <CardContent>
                    <div>
                        <div>
                            <Users />
                            {workspace.members.length} members
                        </div>
                        <div>
                            <MessageSquare />
                            {workspace.settings.features.chat ? 'Chat enabled':'Chat disabled'}
                        </div>
                        <div>
                            <FileText className='' />
                            {workspace.settings.features.files?'Files enabled':'Files disabled'}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Tabs defaultValue="projects">
                <TabsList>
                    <TabsTrigger value="Projects">Projects</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="files">Files</TabsTrigger>
                </TabsList>
                <TabsContent value="projects">
                    <ProjectList workspaceId={id} />
                </TabsContent>
                <TabsContent value="files">
                    <FileList workspaceId={id} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default WorkspaceDetail

const MembersList=({members})=>{
    return (
        <div>
            {members.map((member)=>(
                <Card>
                    <CardContent>
                        <div>
                            <div>
                                {members.user.name.charAt(0)}
                            </div>
                            <div>
                                <p>{member.user.name}</p>
                                <p>{memeber.user.email}</p>
                            </div>
                        </div>
                        <div>
                            <span className=''>
                                {member.role}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

const FilesList=({workspaceId})=>{
    return (
        <div className='p-4'>
            <p className='text-gray-500'>Files feature coming soon...</p>
        </div>
    )
}