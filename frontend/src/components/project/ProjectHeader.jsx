import React from 'react'
import {Card,CardContent} from '../ui/card'
import {Calendar,Users,Clock,BarChart2} from 'lucide-react'
import {Progress} from '../ui/progress'


const ProjectHeader=({project})=>{
    const calculateProgress=()=>{
        const totalTasks=project.tasks?.length || 0;
        const completedTasks=project.tasks?.filter(task=>task.status==='completed').length||0;
        return totalTasks?(completedTasks/totalTasks)*100:0;
    }

    return (
        <div>
            <div>
                <div>
                    <h1>{project.name}</h1>
                    <p>{project.description}</p>
                </div>
                <div>
                    <Progress value={calculateProgress()} />
                    <span>{Math.round(calculateProgress())}% Complete</span>
                </div>
            </div>
            <div>
                <Card>
                    <CardContent>
                        <Calendar className='flex items-center p-4' />
                        <div>
                            <p></p>
                            <p>{new Date(project.endDate).toLocaleDateString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Users />
                        <div>
                            <p>Team Members</p>
                            <p>{project.members?.length || 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Clock />
                        <div>
                            <p>Priority</p>
                            <p>{project.priority}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <BarChart2 />
                        <div>
                            <p>Total Tasks</p>
                            <p>{project.tasks?.length || 0}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default ProjectHeader