import React,{useState} from 'react'
import { useTasks } from '../../hooks/useTasks';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Button } from '../ui/button';
import { PlusCircle, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger} from '../ui/dropdown-menu';
import CreateTask from './CreateTask';

const TaskList=({projectId})=>{
    const {tasks,deleteTask,isLaoding}=useTasks(projectId)
    const [showCreateModal,setShowCreateModal] =useState(false)
    const [editingTask,setEditingTask]=useState(null)

    if(isLaoding) return <div>Loading tasks...</div>

    return(
        <div>
            <div>
                <Button onClick={()=>setShowCreateModal(true)}>
                    <PlusCircle className='w-4 h-4 mr-2' />
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map(task=>(
                        <TableRow key={task._id}>
                            <TableCell>{task.title}</TableCell>
                            <TableCell>
                                <span>
                                    {task.status==='inProgress'?'In Progress':task.status}
                                </span>
                            </TableCell>
                            <TableCell>
                                {task.assignee?.name || 'Unassigned'}
                            </TableCell>
                            <TableCell>
                                <span>
                                    {task.priority}
                                </span>
                            </TableCell>
                            <TableCell>
                                {new Date(task.dueDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost">
                                            <MoreVertical className='w-4 h-4'/>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem>
                                            <Edit2 />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={()=>deleteTask(task._id)}>
                                            <Trash2 />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {(showCreateModal || editingTask) && (
                <CreateTask projectId={projectId} task={editingTask} onClose={()=>{
                    setShowCreateModal(false)
                    setEditingTask(null)
                }} />
            )}
        </div>
    )
}

export default TaskList;