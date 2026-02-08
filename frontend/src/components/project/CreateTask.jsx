import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, updateTask, fetchTasks } from '../../redux/slices/taskSlice';
import { CalendarIcon,XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

const CreateTask = ({ projectId, workspaceId, task = null, onClose, open }) => {
    const dispatch = useDispatch();
    const { isLoading, error: taskSliceError } = useSelector(state => state.task);
    const [localError, setLocalError] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const form = useForm({
         defaultValues: {
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
            dueDate: null,
            estimatedHours: 0,
            assignedTo: [], 
            tags: [] 
        }
    });

     
    useEffect(() => {
        if (open) {
            form.reset({
                title: task?.title || '',
                description: task?.description || '',
                status: task?.status || 'todo',
                priority: task?.priority || 'medium',
                dueDate: task?.dueDate ? new Date(task.dueDate) : null,
                estimatedHours: task?.estimatedHours || 0,
                
                assignedTo: task?.assignedTo?.map(u => typeof u === 'object' ? u._id : u) || [],
                
                tags: task?.tags || []
            });
            setSelectedFiles([]); 
            setLocalError(null); 
        }
    }, [open, task, form]); 

     
     const handleFileChange = (event) => {
        setSelectedFiles(Array.from(event.target.files || []));
     };

     
     const removeSelectedFile = (indexToRemove) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
     };


    const onSubmit = async (data) => {
        setLocalError(null); 

        const formData = new FormData();

        
        formData.append('title', data.title.trim());
        formData.append('description', data.description?.trim() || '');
        formData.append('status', data.status);
        formData.append('priority', data.priority);
        if (data.dueDate) formData.append('dueDate', data.dueDate.toISOString());
        formData.append('estimatedHours', Number(data.estimatedHours) || 0);
        formData.append('project', projectId); 
        formData.append('workspace', workspaceId); 

        
        (data.assignedTo || []).forEach(id => formData.append('assignedTo[]', id));
        (data.tags || []).forEach(tag => formData.append('tags[]', tag));

        
        if (!task) { 
            selectedFiles.forEach(file => {
                formData.append('attachments', file); 
            });
        }

        try {
            let resultAction;
            if (task) {
                
                
                
                 const updateData = {
                    title: data.title.trim(),
                    description: data.description?.trim() || '',
                    status: data.status,
                    priority: data.priority,
                    dueDate: data.dueDate ? data.dueDate.toISOString() : null,
                    estimatedHours: Number(data.estimatedHours) || 0,
                    assignedTo: data.assignedTo || [],
                     tags: data.tags || [],
                 };
                
                 resultAction = await dispatch(updateTask({ taskId: task._id, updates: updateData }));
                if (updateTask.rejected.match(resultAction)) {
                     throw new Error(resultAction.payload || 'Failed to update task');
                }
                toast.success('Task updated successfully!');

            } else {
                
                
                 resultAction = await dispatch(createTask({ formData }));
                 if (createTask.rejected.match(resultAction)) {
                     throw new Error(resultAction.payload || 'Failed to create task');
                 }
                 toast.success('Task created successfully!');
            }

            
            dispatch(fetchTasks({ projectId })); 
            onClose(); 

        } catch (error) {
            console.error('Failed to save task:', error);
            setLocalError(error.message || 'An unknown error occurred');
             toast.error(error.message || 'Failed to save task.');
        }
        
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card backdrop-blur-sm border-2 border-border rounded-xl shadow-2xl">
                <DialogHeader className="space-y-1 pb-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-chart-1 to-chart-4 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <DialogTitle className="text-3xl font-bold text-foreground">{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">{task ? 'Update task details and assignments' : 'Add a new task to track progress'}</p>
                        </div>
                    </div>
                </DialogHeader>

                {(localError || taskSliceError) && (
                    <div className="text-destructive bg-destructive/10 border-2 border-destructive/50 p-4 rounded-lg text-sm my-4">
                        <strong>Error:</strong> {localError || taskSliceError}
                    </div>
                )}

                <Form {...form}>
                    <div className="pr-2 max-h-[calc(90vh-200px)] overflow-y-auto">
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
                            {/* --- Title --- */}
                            <FormField
                                control={form.control}
                                name="title"
                                rules={{ required: 'Title is required' }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-foreground">Title*</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Implement user authentication, Fix navigation bug"
                                                {...field}
                                                maxLength={200}
                                                className="bg-card text-foreground border-2 border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all h-12 text-base placeholder:text-muted-foreground"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-destructive" />
                                        <p className="text-xs text-muted-foreground pl-1">{field.value?.length || 0}/200 characters</p>
                                    </FormItem>
                                )}
                            />

                            {/* --- Description --- */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-semibold text-foreground">Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Provide detailed information about this task, acceptance criteria, or any relevant notes..."
                                                maxLength={1000}
                                                className="min-h-[120px] bg-card text-foreground border-2 border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all resize-none placeholder:text-muted-foreground"
                                                {...field}
                                                rows={5}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-destructive" />
                                        <p className="text-xs text-muted-foreground pl-1">{field.value?.length || 0}/1000 characters</p>
                                    </FormItem>
                                )}
                            />

                            {/* --- Status & Priority --- */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Status */}
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold text-foreground">Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-card text-foreground border-2 border-border focus:border-primary focus:ring-2 focus:ring-ring h-11">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-card border-border text-foreground">
                                                    <SelectItem value="todo" className="hover:bg-accent cursor-pointer">To Do</SelectItem>
                                                    <SelectItem value="in-progress" className="hover:bg-accent cursor-pointer">In Progress</SelectItem>
                                                    <SelectItem value="review" className="hover:bg-accent cursor-pointer">Review</SelectItem>
                                                    <SelectItem value="done" className="hover:bg-accent cursor-pointer">Done</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-destructive" />
                                        </FormItem>
                                    )}
                                />
                                {/* Priority */}
                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold text-foreground">Priority</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-card text-foreground border-2 border-border focus:border-primary focus:ring-2 focus:ring-ring h-11">
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-card border-border text-foreground">
                                                    <SelectItem value="low" className="hover:bg-accent cursor-pointer">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-chart-2"></span>
                                                            Low
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="medium" className="hover:bg-accent cursor-pointer">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-chart-3"></span>
                                                            Medium
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="high" className="hover:bg-accent cursor-pointer">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-chart-4"></span>
                                                            High
                                                        </span>
                                                    </SelectItem>
                                                    <SelectItem value="critical" className="hover:bg-accent cursor-pointer">
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full bg-chart-5"></span>
                                                            Critical
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-destructive" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* --- Due Date & Estimated Hours --- */}
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-sm font-semibold text-foreground">Due Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={`w-full justify-start text-left font-normal h-11 bg-card border-2 border-border hover:bg-accent hover:border-primary ${!field.value ? "text-muted-foreground" : "text-foreground"}`}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage className="text-destructive" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="estimatedHours"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold text-foreground">Estimated Hours</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.5"
                                                    placeholder="0.0"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    className="bg-card text-foreground border-2 border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all h-11 placeholder:text-muted-foreground"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-destructive" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* --- File Input (Only for Create) --- */}
                            {!task && (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold text-foreground">Attachments (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="bg-card text-foreground border-2 border-border focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 transition-all h-11 cursor-pointer"
                                        />
                                    </FormControl>
                                    {selectedFiles.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-muted border border-border p-3 rounded-lg hover:bg-accent transition-colors">
                                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                                        <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                        <span className="truncate text-sm text-foreground">{file.name}</span>
                                                        <span className="text-xs text-muted-foreground flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeSelectedFile(index)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/20 p-2 h-auto flex-shrink-0"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}

                            {/* --- Assignees & Tags (Future enhancement) --- */}
                            {/* TODO: Add multi-select components for assignees and tags */}

                            <DialogFooter className="flex justify-end gap-3 mt-6 pt-6 border-t border-border sticky bottom-0 bg-card">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="px-6 h-11 border-2 border-border bg-muted text-foreground hover:bg-muted hover:border-border font-medium"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-11 shadow-lg hover:shadow-xl transition-all"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : (
                                        task ? 'Update Task' : 'Create Task'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

CreateTask.propTypes={
    workspaceId:PropTypes.string.isRequired,
    open:PropTypes.bool.isRequired,
    task:PropTypes.object,
    projectId:PropTypes.string,
    onClose:PropTypes.func.isRequired
}

export default CreateTask;