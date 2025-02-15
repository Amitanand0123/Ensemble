import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTasks } from '../../hooks/useTasks';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useDispatch } from 'react-redux';
import { fetchTasks } from '../../redux/slices/taskSlice';
import { CalendarIcon } from 'lucide-react';

const CreateTask = ({ projectId, workspaceId, task = null, onClose, open }) => {
    const { createTask, updateTask } = useTasks(projectId);
    const [isLoading, setIsLoading] = useState(false);
    const [error,setError]=useState(null)
    const dispatch = useDispatch();

    useEffect(()=>{
        if(open){
            form.reset({
                title: task?.title || '',
                description: task?.description || '',
                status: task?.status || 'todo',
                priority: task?.priority || 'medium',
                dueDate: task?.dueDate ? new Date(task.dueDate) : null,
                estimatedHours: task?.estimatedHours || 0,
                assignedTo: task?.assignedTo || [],
                tags: task?.tags || []
            })
        }
    },[open,task])

    const form = useForm({
        defaultValues: {
            title: task?.title || '',
            description: task?.description || '',
            status: task?.status || 'todo',
            priority: task?.priority || 'medium',
            dueDate: task?.dueDate ? new Date(task.dueDate) : null,
            estimatedHours: task?.estimatedHours || 0,
            assignedTo: task?.assignedTo || [],
            tags: task?.tags || []
        }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError(null)
        try {
            const taskData={
                title:data.title.trim(),
                description:data.description.trim(),
                status:data.status,
                priority:data.priority,
                dueDate:data.dueDate? data.dueDate.toISOString():null,
                estimatedHours:Number(data.estimatedHours) || 0,
                assignedTo:data.assignedTo || [],
                tags:data.tags || [],
                project:projectId,
                workspace:workspaceId
            }
            console.log('Task data:', taskData)
            console.log("Project ID:",projectId);
            console.log("Workspace ID:",workspaceId);
            if(!taskData.title || !taskData.project || !taskData.workspace){
                throw new Error('Title, project and workspace are required')
            }
            await createTask(taskData)
            dispatch(fetchTasks({projectId}))
            onClose()
        } catch (error) {
            setError(error.message || 'Failed to save task')
            console.error('Failed to save task:',error)
        } finally{
            setIsLoading(false)
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                </DialogHeader>

                {error && (
                    <div className="text-red-500 text-sm mb-4">
                        {error}
                    </div>
                )}
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            rules={{
                                required: 'Title is required',
                                minLength: { value: 1, message: 'Title is required' },
                                maxLength: { value: 200, message: 'Title cannot exceed 200 characters' }
                            }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter task title" {...field} onChange={(e) => field.onChange(e.target.value.trim())} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Enter task description" 
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="todo">To Do</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="review">Review</SelectItem>
                                                <SelectItem value="done">Done</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                                    variant="outline"
                                                    className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "PPP") : "Pick a date"}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading || !form.formState.isValid}>
                                {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTask;