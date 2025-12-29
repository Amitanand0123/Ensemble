import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks, deleteTask as deleteTaskAction } from '../../redux/slices/taskSlice';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, MoreVertical, Edit2, Trash2, Paperclip, Search, ListTodo, Loader2 } from 'lucide-react';
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

    const getStatusColor = (status) => {
        switch(status) {
            case 'done':
                return 'text-chart-4 bg-chart-4/10 border border-chart-4/30';
            case 'in-progress':
                return 'text-chart-1 bg-chart-1/10 border border-chart-1/30';
            case 'review':
                return 'text-chart-2 bg-chart-2/10 border border-chart-2/30';
            case 'todo':
            default:
                return 'text-muted-foreground bg-accent/50 border border-border';
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'critical':
                return 'text-destructive bg-destructive/10 border border-destructive/30';
            case 'high':
                return 'text-chart-5 bg-chart-5/10 border border-chart-5/30';
            case 'medium':
                return 'text-chart-2 bg-chart-2/10 border border-chart-2/30';
            case 'low':
                return 'text-chart-4 bg-chart-4/10 border border-chart-4/30';
            default:
                return 'text-muted-foreground bg-accent/50 border border-border';
        }
    };

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
        <Card className="w-full bg-card/60 backdrop-blur-sm rounded-xl border-2 border-border shadow-lg animate-fadeInUp">
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                    <h2 className="text-xl lg:text-2xl font-bold text-foreground">Tasks</h2>
                    <div className="flex flex-col sm:flex-row gap-3 flex-1 sm:max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-input border-2 border-border rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all text-sm placeholder:text-muted-foreground"
                            />
                        </div>
                        <Button
                            onClick={() => { setEditingTask(null); setShowCreateModal(true); }}
                            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2 justify-center whitespace-nowrap"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Create Task
                        </Button>
                    </div>
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
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading tasks...</p>
                    </div>
                ) : error ? (
                    <div className="bg-destructive/10 border border-destructive/50 text-destructive p-4 rounded-lg text-center">
                        <p className="font-medium">Error loading tasks</p>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                ) : filteredTasks.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent bg-accent/30">
                                    <TableHead className="text-foreground font-semibold">Title</TableHead>
                                    <TableHead className="text-foreground font-semibold">Status</TableHead>
                                    <TableHead className="text-foreground font-semibold">Priority</TableHead>
                                    <TableHead className="text-foreground font-semibold">Due Date</TableHead>
                                    <TableHead className="text-foreground font-semibold">Assignee</TableHead>
                                    <TableHead className="text-foreground font-semibold">Files</TableHead>
                                    <TableHead className="text-right text-foreground font-semibold w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTasks.map((task, index) => (
                                    <TableRow
                                        key={task._id}
                                        className="border-border hover:bg-accent/20 transition-colors animate-fadeInUp"
                                        style={{ animationDelay: `${index * 30}ms` }}
                                    >
                                        <TableCell className="font-medium text-foreground">{task.title}</TableCell>
                                        <TableCell>
                                            <span className={`capitalize px-2.5 py-1 rounded-md text-xs font-semibold ${getStatusColor(task.status)}`}>
                                                {task.status.replace('-', ' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`capitalize px-2.5 py-1 rounded-md text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '–'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {task.assignedTo && task.assignedTo.length > 0
                                                ? task.assignedTo.map(assignee => (assignee?.name?.first || 'Unassigned')).join(', ')
                                                : 'Unassigned'}
                                        </TableCell>
                                        <TableCell>
                                            {task.attachments && task.attachments.length > 0 && (
                                                <div className="flex items-center gap-1.5 text-muted-foreground text-xs" title={`${task.attachments.length} attachment(s)`}>
                                                    <Paperclip className="w-3.5 h-3.5" />
                                                    <span>({task.attachments.length})</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-card border-border">
                                                    <DropdownMenuItem onClick={() => handleEditTask(task)} className="cursor-pointer hover:bg-accent focus:bg-accent text-foreground">
                                                        <Edit2 className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={(e)=>e.preventDefault()} className="cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-card border-border">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle className="text-foreground">Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription className="text-muted-foreground">
                                                                    This action cannot be undone. This will permanently delete the task &quot;{task.title}&quot;.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel className="border-border hover:bg-accent">Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteTask(task._id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                                                    Yes, delete task
                                                                </AlertDialogAction>
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
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto bg-accent/30 border-2 border-dashed border-border rounded-xl p-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                                <ListTodo className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {searchQuery ? 'No tasks found' : 'No tasks yet'}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                {searchQuery ? 'Try adjusting your search criteria' : 'Create your first task to get started'}
                            </p>
                        </div>
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