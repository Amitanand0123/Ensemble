// --- START OF FILE frontend/src/components/project/TaskList.jsx ---

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks } from '../../redux/slices/taskSlice'; // Only need fetchTasks if not using hook for initial load
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Import Input
import { PlusCircle, MoreVertical, Edit2, Trash2, Paperclip, Search, ListTodo } from 'lucide-react'; // Import Search icon
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CreateTask from './CreateTask'; // Assuming CreateTask handles edit too
import { useTasks } from '../../hooks/useTasks'; // Using the hook for delete/refresh
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast'; // Import toast
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // For delete confirmation


const TaskList = ({ projectId, workspaceId }) => {
    const dispatch = useDispatch();
    // Get full task list from Redux state
    const allTasks = useSelector((state) => state.task.tasks || []);
    const isLoading = useSelector((state) => state.task.isLoading);
    const error = useSelector((state) => state.task.error);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null); // Task object to edit
    const [searchQuery, setSearchQuery] = useState(''); // State for search query

    // Use the hook for actions like delete and potentially refresh
    const { deleteTask: deleteTaskHook, refreshTasks } = useTasks(projectId, workspaceId);

    // Initial fetch when projectId changes
    useEffect(() => {
        if (projectId) {
            // console.log(`[TaskList] Fetching tasks for projectId: ${projectId}`);
            dispatch(fetchTasks({ projectId }));
        }
    }, [projectId, dispatch]);

    // Handle opening the modal for editing
    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowCreateModal(true); // Open the same modal for editing
    };

    // Handle closing the modal (for both create and edit)
    const handleCloseModal = () => {
        setShowCreateModal(false);
        setEditingTask(null); // Clear editing state
        // Optionally refresh tasks after create/edit
        // dispatch(fetchTasks({ projectId })); // Or rely on thunk to update state
    };


    // Handle deleting a task
    const handleDeleteTask = async (taskId) => {
        if (!taskId) return;
        const loadingToast = toast.loading('Deleting task...');
        try {
            await deleteTaskHook(taskId); // Use the hook's delete function
            toast.success('Task deleted successfully.', { id: loadingToast });
            // Refresh list after delete - Redux state should update, but explicit fetch ensures consistency
            dispatch(fetchTasks({ projectId }));
        } catch (error) {
            console.error("Failed to delete task:", error);
            toast.error(`Failed to delete task: ${error.message || 'Unknown error'}`, { id: loadingToast });
        }
    };

    // Filter tasks based on search query (title or description)
    const filteredTasks = (allTasks || []).filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );


    return (
        <Card className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-white mt-4 animate-fade-in-up">
            <CardContent className="p-6">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h2 className="text-xl font-semibold">Tasks</h2>
                    {/* Search Input for Tasks */}
                    <div className="relative flex-grow max-w-xs">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                         <Input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700/50 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                         />
                    </div>
                    <Button
                        onClick={() => { setEditingTask(null); setShowCreateModal(true); }} // Ensure editingTask is null for create
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                        size="sm"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Create Task
                    </Button>
                </div>

                {/* Create/Edit Task Modal */}
                {/* Pass handleCloseModal to the CreateTask component */}
                {(showCreateModal || editingTask) && (
                    <CreateTask
                        projectId={projectId}
                        workspaceId={workspaceId}
                        open={showCreateModal || !!editingTask} // Modal is open if creating or editing
                        task={editingTask} // Pass the task to edit, or null for create
                        onClose={handleCloseModal} // Use the closing handler
                    />
                )}

                {/* Task Table */}
                {isLoading ? (
                    <div className="p-4 text-center text-gray-400">Loading tasks...</div>
                ) : error ? (
                    <div className="p-4 text-red-500 text-center">Error loading tasks: {error}</div>
                ) : filteredTasks.length > 0 ? (
                    <div className="overflow-x-auto"> {/* Make table responsive */}
                        <Table>
                            <TableHeader>
                                <TableRow className="border-gray-700 hover:bg-transparent">
                                    <TableHead className="text-gray-300">Title</TableHead>
                                    <TableHead className="text-gray-300">Status</TableHead>
                                    <TableHead className="text-gray-300">Priority</TableHead>
                                    <TableHead className="text-gray-300">Due Date</TableHead>
                                    <TableHead className="text-gray-300">Assignee</TableHead>
                                    <TableHead className="text-gray-300">Files</TableHead>
                                    <TableHead className="text-right text-gray-300 w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTasks.map(task => (
                                    <TableRow key={task._id} className="border-gray-700 hover:bg-gray-700/30">
                                        <TableCell className="font-medium">{task.title}</TableCell>
                                        <TableCell>
                                            <span className={`capitalize px-2 py-0.5 rounded-full text-xs ${task.status === 'done' ? 'bg-green-600/70 text-green-100' : task.status === 'in-progress' ? 'bg-blue-600/70 text-blue-100' : task.status === 'review' ? 'bg-yellow-600/70 text-yellow-100' : 'bg-gray-600/70 text-gray-200'}`}>
                                                {task.status.replace('-', ' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                             <span className={`capitalize px-2 py-0.5 rounded-full text-xs ${task.priority === 'high' || task.priority === 'critical' ? 'bg-red-600/70 text-red-100' : task.priority === 'medium' ? 'bg-yellow-600/70 text-yellow-100' : 'bg-green-600/70 text-green-100'}`}>
                                                {task.priority}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '–'}
                                        </TableCell>
                                        <TableCell>
                                            {/* Display multiple assignees if assignedTo is an array */}
                                            {task.assignedTo && task.assignedTo.length > 0
                                                ? task.assignedTo.map(assignee => assignee?.name || 'Unassigned').join(', ')
                                                : 'Unassigned'}
                                        </TableCell>
                                         <TableCell>
                                            {task.attachments && task.attachments.length > 0 && (
                                                <div className="flex items-center gap-1 text-gray-400 text-xs" title={`${task.attachments.length} attachment(s)`}>
                                                    <Paperclip className="w-3 h-3" />
                                                    ({task.attachments.length})
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
                                                    <DropdownMenuItem onClick={() => handleEditTask(task)} className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>

                                                    {/* Delete Confirmation */}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e)=>e.preventDefault()} className="cursor-pointer text-red-400 hover:bg-red-900/50 focus:bg-red-900/50 focus:text-red-300">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-gray-300">
                                                                    This action cannot be undone. This will permanently delete the task "{task.title}".
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteTask(task._id)} className="bg-red-600 hover:bg-red-700">Yes, delete task</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                     <div className="text-center py-10 text-gray-500">
                         <ListTodo className="mx-auto h-10 w-10 mb-3" />
                        {searchQuery ? 'No tasks found matching your search.' : 'No tasks found for this project yet.'}
                    </div>
                )}

            </CardContent>
        </Card>
    );
};

export default TaskList;
// --- END OF FILE frontend/src/components/project/TaskList.jsx ---