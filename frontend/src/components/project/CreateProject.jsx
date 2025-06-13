import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createProject, fetchProjects } from '../../redux/slices/projectSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import PropTypes from 'prop-types';

const availableTags = ['Feature', 'Bug', 'Enhancement', 'UI/UX', 'Backend', 'Frontend', 'Documentation', 'Testing'];

const CreateProject = ({ workspaceId, open, onOpenChange }) => {
    const dispatch = useDispatch();
    const { isLoading, error: projectError } = useSelector(state => state.projects);
    const [localError, setLocalError] = useState('');

    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
            priority: 'medium',
            isPrivate: false,
            tags: [],
        }
    });

    const { handleSubmit, control, reset, watch, setValue } = form;
    const selectedTags = watch('tags');

    useEffect(() => {
        if (open) {
            reset({
                name: '',
                description: '',
                priority: 'medium',
                isPrivate: false,
                tags: [],
            });
            setLocalError('');
        }
    }, [open, reset]);

    const handleTagClick = (tag) => {
        const currentTags = watch('tags');
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];
        setValue('tags', newTags, { shouldValidate: true });
    };

    const onSubmit = async (data) => {
        setLocalError('');
        const projectData = {
            name: data.name,
            description: data.description,
            workspace: workspaceId,
            priority: data.priority,
            settings: {
                isPrivate: data.isPrivate,
                tags: data.tags,
            }
        };

        try {
            await dispatch(createProject(projectData)).unwrap();
            toast.success('Project created successfully!');
            dispatch(fetchProjects(workspaceId)); // Refresh project list for the workspace
            onOpenChange(false);
        } catch (err) {
            setLocalError(err.message || 'Failed to create project.');
            toast.error(err.message || 'Failed to create project.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gray-800 text-white rounded-md p-6 shadow-lg fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] focus:outline-none w-[90%] max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
                    <DialogClose asChild>
                        <Button className="absolute top-4 right-4 rounded-full p-0 w-6 h-6" variant="ghost">
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogClose>
                </DialogHeader>

                {(localError || projectError) && (
                    <Alert variant="destructive" className="my-4">
                        <AlertDescription>{localError || projectError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name*</Label>
                        <Input
                            id="name"
                            placeholder="Enter project name"
                            {...form.register('name', { required: 'Project name is required' })}
                            className="bg-gray-900 text-white"
                        />
                        {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Project description (optional)"
                            {...form.register('description')}
                            className="bg-gray-900 text-white min-h-[80px]"
                            rows={3}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger id="priority" className="w-full bg-gray-900 text-white">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Controller
                            name="isPrivate"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    id="isPrivate"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="isPrivate" className="text-sm">Private Project</Label>
                    </div>

                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map(tag => (
                                <Button
                                    key={tag}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "rounded-full px-3 py-1 text-xs transition-colors",
                                        selectedTags.includes(tag)
                                            ? 'bg-purple-600 hover:bg-purple-700 text-white border-transparent'
                                            : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                                    )}
                                    onClick={() => handleTagClick(tag)}
                                >
                                    {tag}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="pt-4 justify-end space-x-3">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90">
                            {isLoading ? <Loader2 className="animate-spin" /> : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

CreateProject.propTypes={
    workspaceId:PropTypes.string.isRequired,
    onOpenChange:PropTypes.func.isRequired,
    open:PropTypes.bool.isRequired
}

export default CreateProject;