import React from 'react'
import {Link} from 'react-router-dom'
import { useWorkspaces } from '../../hooks/useWorkspaces.js'
import {Card,CardHeader,CardTitle,CardContent} from '../ui/card'
import {Button} from '../ui/button'
import { PlusCircle,Settings,Users } from 'lucide-react'

const WorkspaceList=()=>{
    const {workspaces,isLoading,error,selectWorkspace}=useWorkspaces()
    if(isLoading) return <div>Loading workspaces...</div>
    if(error) return <div>Error loading workspaces: {error}</div>

    return(
        <div>
            <div>
                <h2>Your Workspaces</h2>
                <Link to="/workspace/create">
                    <Button className='flex-items-center gap-2'>
                        <PlusCircle />
                        New Workspace
                    </Button>
                </Link>
            </div>

            <div>
                {workspaces.map((workspace)=>(
                    <Card key={workspace._id}>
                        <CardHeader>
                            <CardTitle>
                                <Link>
                                    {workspace.name}
                                </Link>
                                <Link to={`/workspace/${workspace._id}/settings`}>
                                    <Settings className='w-4 h-4 text-gray-500 hover:text-gray-700' />
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='text-sm text-gray-600 mb-4'>{workspace.description}</p>
                            <div>
                                <Users className='w-4 h-4 text-gray-500' />
                                {workspace.members.length} members
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default WorkspaceList;