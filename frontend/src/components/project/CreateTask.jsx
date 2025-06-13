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
            <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto bg-gray-800 text-white border-gray-700"> {/* Style adjustment */}
                <DialogHeader>
                    <DialogTitle className="text-xl">{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                </DialogHeader>

                {(localError || taskSliceError) && (
                    <div className="text-red-400 bg-red-900/30 border border-red-700 p-3 rounded-md text-sm mb-4">
                        Error: {localError || taskSliceError}
                    </div>
                )}

                <Form {...form}>
                    {/* Wrap form content in a div for scrolling if needed */}
                    <div className="pr-2 max-h-[calc(90vh-200px)] overflow-y-auto"> {/* Adjust max-height as needed */}
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* --- Title --- */}
                            <FormField
                                control={form.control}
                                name="title"
                                rules={{ required: 'Title is required' }} 
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter task title" {...field} className="bg-gray-700 border-gray-600" />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            {/* --- Description --- */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter task description"
                                                className="min-h-[100px] bg-gray-700 border-gray-600"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
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
                                            <FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-gray-700 border-gray-600">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-gray-700 text-white border-gray-600">
                                                    <SelectItem value="todo">To Do</SelectItem>
                                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                                    <SelectItem value="review">Review</SelectItem>
                                                    <SelectItem value="done">Done</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                                {/* Priority */}
                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                         <FormItem>
                                            <FormLabel>Priority</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-gray-700 border-gray-600">
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-gray-700 text-white border-gray-600">
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="critical">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className="text-red-400" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* --- Due Date --- */}
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Due Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"} bg-gray-700 border-gray-600 hover:bg-gray-600`} 
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-gray-700 border-gray-600" align="start"> {/* Style adjustment */}
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    className="text-white" 
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                             {/* --- Estimated Hours --- */}
                            <FormField
                                control={form.control}
                                name="estimatedHours"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estimated Hours</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.5"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                className="bg-gray-700 border-gray-600"
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                             {/* --- File Input (Only for Create) --- */}
                             {!task && (
                                <FormItem>
                                    <FormLabel>Attachments</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="bg-gray-700 border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                        />
                                    </FormControl>
                                    {/* Display selected files */}
                                     <div className="mt-2 space-y-1 text-sm">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-700 p-1 rounded">
                                                <span className="truncate max-w-[80%]">{file.name}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeSelectedFile(index)}
                                                    className="text-red-400 hover:text-red-300 p-0 h-auto"
                                                    >
                                                    <XCircle className="w-4 h-4"/>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                             )}

                            {/* --- Assignees & Tags (Needs improvement - maybe multi-select components) --- */}
                            {/* Example placeholder - replace with actual components */}
                            {/* <FormItem> <FormLabel>Assignees</FormLabel> <Input placeholder="Assignee IDs (comma-separated)" {...form.register('assignedTo')} className="bg-gray-700 border-gray-600"/> </FormItem>
                             <FormItem> <FormLabel>Tags</FormLabel> <Input placeholder="Tags (comma-separated)" {...form.register('tags')} className="bg-gray-700 border-gray-600"/> </FormItem> */}


                             <DialogFooter className="mt-6 sticky bottom-0 bg-gray-800 py-4"> {/* Make footer sticky if form scrolls */}
                                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading /*|| !form.formState.isValid*/}>
                                    {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
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