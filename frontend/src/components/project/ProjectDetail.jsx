import React,{useEffect} from 'react'
import { useParams } from 'react-router-dom'
import { useProjects } from '../../hooks/useProjects'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {Calendar,Users,Clock} from 'lucide-react'
import TaskBoard from './TaskBoard.jsx';
import ProjectSettings from './ProjectSettings.jsx';
import TaskList from './TaskList.jsx';

const ProjectDetail=()=>{
    const {id}=useParams()
    const {projects,selectProject,isLoading}=useProjects()
    const project=projects.find(p=>p._id===id)

    useEffect(()=>{
        if(project){
            selectProject(project)
        }
    },[project,selectProject])

    if(isLoading) return <div>Loading...</div>
    if(!project) return <div>Project not found</div>

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <p>{project.description}</p>
                </CardHeader>
                <CardContent>
                    <div>
                        <div>
                            <Calendar/>
                            Due:{new Date(project.endDate).toLocalDateString()}
                        </div>
                        <div>
                            <Users />
                            {project.members.length} members
                        </div>
                        <div>
                            <Clock />
                            Priority:{project.priority}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Tabs>
                <TabsList>
                    <TabsTrigger>Board</TabsTrigger>
                    <TabsTrigger>List</TabsTrigger>
                    <TabsTrigger>Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="board">
                    <TaskBoard projectId={id} />
                </TabsContent>
                <TabsContent value="list">
                    <TaskList projectId={id} />
                </TabsContent>
                <TabsContent value="settings">
                    <ProjectSettings projectId={id} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default ProjectDetail