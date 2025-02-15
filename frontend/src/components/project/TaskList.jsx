import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks } from '../../redux/slices/taskSlice';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CreateTask from './CreateTask';
import { useTasks } from '../../hooks/useTasks';
import { Card, CardContent } from '@/components/ui/card';

const TaskList = ({ projectId, workspaceId }) => {
    const dispatch = useDispatch();
    const tasks = useSelector((state) => state.task.tasks || []);
    const isLoading = useSelector((state) => state.task.isLoading);
    const error = useSelector((state) => state.task.error);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const { deleteTask } = useTasks(projectId, workspaceId);

    useEffect(() => {
        if (projectId) {
            dispatch(fetchTasks({ projectId }));
        }
    }, [projectId, dispatch]);

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
            dispatch(fetchTasks({ projectId }));
        } catch (error) {
            console.error("Failed to delete task:", error);
        }
    };

    return (
        <Card className="w-full">
            <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Tasks</h2>
                    <Button 
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Create Task
                    </Button>
                </div>

                {(showCreateModal || editingTask) && (
                    <CreateTask 
                        projectId={projectId}
                        workspaceId={workspaceId}
                        open={true}
                        task={editingTask}
                        onClose={() => {
                            setShowCreateModal(false);
                            setEditingTask(null);
                        }}
                    />
                )}

                {isLoading ? (
                    <div className="p-4 text-center">Loading tasks...</div>
                ) : error ? (
                    <div className="p-4 text-red-500 text-center">Error: {error}</div>
                ) : tasks.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assignee</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.map(task => (
                                <TableRow key={task._id}>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell>
                                        <span className="capitalize">
                                            {task.status === 'inProgress' ? 'In Progress' : task.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {task.assignedTo?.name || 'Unassigned'}
                                    </TableCell>
                                    <TableCell>
                                        <span className="capitalize">{task.priority}</span>
                                    </TableCell>
                                    <TableCell>
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingTask(task)}>
                                                    <Edit2 className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => handleDeleteTask(task._id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-6 text-gray-500">
                        No tasks found. Create your first task!
                    </div>
                )}
                
            </CardContent>
        </Card>
    );
};

export default TaskList;