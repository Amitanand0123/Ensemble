import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks, deleteTask as deleteTaskAction } from '../../redux/slices/taskSlice';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, MoreVertical, Edit2, Trash2, Paperclip, Search, ListTodo } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import CreateTask from './CreateTask';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import PropTypes from 'prop-types';

const TaskList = ({ projectId, workspaceId }) => {
    const dispatch = useDispatch();
    const { tasks: allTasks = [], isLoading, error } = useSelector((state) => state.task);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (projectId) {
            dispatch(fetchTasks({ projectId }));
        }
    }, [projectId, dispatch]);

    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setEditingTask(null);
    };

    const handleDeleteTask = async (taskId) => {
        if (!taskId) return;
        const loadingToast = toast.loading('Deleting task...');
        try {
            await dispatch(deleteTaskAction({ taskId })).unwrap();
            toast.success('Task deleted successfully.', { id: loadingToast });
        } catch (err) {
            console.error("Failed to delete task:", err);
            toast.error(`Failed to delete task: ${err || 'Unknown error'}`, { id: loadingToast });
        }
    };

    const filteredTasks = allTasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Card className="w-full bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-white mt-4 animate-fade-in-up">
            <CardContent className="p-6">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <h2 className="text-xl font-semibold">Tasks</h2>
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
                        onClick={() => { setEditingTask(null); setShowCreateModal(true); }}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                        size="sm"
                    >
                        <PlusCircle className="w-4 h-4" />
                        Create Task
                    </Button>
                </div>

                {(showCreateModal || editingTask) && (
                    <CreateTask
                        projectId={projectId}
                        workspaceId={workspaceId}
                        open={showCreateModal || !!editingTask}
                        task={editingTask}
                        onClose={handleCloseModal}
                    />
                )}

                {isLoading ? (
                    <div className="p-4 text-center text-gray-400">Loading tasks...</div>
                ) : error ? (
                    <div className="p-4 text-red-500 text-center">Error loading tasks: {error}</div>
                ) : filteredTasks.length > 0 ? (
                    <div className="overflow-x-auto">
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
                                            {task.assignedTo && task.assignedTo.length > 0
                                                ? task.assignedTo.map(assignee => (assignee?.name?.first || 'Unassigned')).join(', ')
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
                                                                    This action cannot be undone. This will permanently delete the task `{task.title}``.
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

TaskList.propTypes={
    projectId:PropTypes.string.isRequired,
    workspaceId:PropTypes.string.isRequired
}

export default TaskList;