import React,{useEffect} from 'react'
import { useDispatch,useSelector } from 'react-redux'
import {Link} from 'react-router-dom'
import {fetchprojects} from '../../redux/slices/projectSlice.js'
import {Card,CardHeader,CardTitle,CardContent} from '@/compoenents/ui/card'
import {Button} from '@/compoenents/ui/button'
import { PlusCircle,Calendar,AlertCircle } from 'lucide-react'

const ProjectList=({workspaceId})=>{
    const dispatch=useDispatch()
    const {projects,isLoading}=useSelector((state)=>state.projects)

    useEffect(()=>{
        dispatch(fetchprojects(workspaceId))
    },[dispatch,workspaceId])

    if(isLoading) return <div>Loading projects...</div>

    return(
        <div className='space-y-4'>
            <div className='flex justify-between items-center'>
                <h3 className='text-sl font-semibold'>projects</h3>
                <Link to={`/workspace/${workspaceId}/projects/create`}>
                    <Button className="flex items-center gap-2">
                        <PlusCircle className='w-4 h-4' />
                        New Project
                    </Button>
                </Link>
            </div>
            <div>
                {projects.map((project)=>(
                    <Card key={project._id}>
                        <CardHeader>
                            <CardTitle>
                                <Link to={`/project/${project._id}`} className='text-lg hover:text-blue-600'>
                                    {project.name}
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='text-sm text-gray-600 mb-4'>{project.description}</p>
                            <div className='flex justify-between text-sm text-gray-500'>
                                <div className='flex items-center'>
                                    <Calendar className='w-4 h-4 mr-2' />
                                    {new Date(project.endDate).toLocaleDateString()}
                                </div>
                                <div>
                                    <AlertCircle className='w-4 h-4 mr-2' />
                                    {project.priority}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default ProjectList;