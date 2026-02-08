import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { createProject, fetchProjects } from '../../redux/slices/projectSlice';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
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
            dispatch(fetchProjects(workspaceId));
            onOpenChange(false);
        } catch (err) {
            setLocalError(err.message || 'Failed to create project.');
            toast.error(err.message || 'Failed to create project.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card backdrop-blur-sm border-2 border-border rounded-xl p-6 shadow-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-1 pb-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-chart-2 to-chart-3 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <DialogTitle className="text-3xl font-bold text-foreground">Create New Project</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">Set up a project to organize your team&apos;s work</p>
                        </div>
                    </div>
                </DialogHeader>

                {(localError || projectError) && (
                    <Alert variant="destructive" className="my-4 border-destructive/50 bg-destructive/10">
                        <AlertDescription className="text-destructive">{localError || projectError}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-foreground">Project Name*</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Mobile App Redesign, Q1 Marketing Campaign"
                            {...form.register('name', { required: 'Project name is required' })}
                            maxLength={100}
                            className="bg-card text-foreground border-2 border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all h-12 text-base placeholder:text-muted-foreground"
                        />
                        {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                        <p className="text-xs text-muted-foreground pl-1">{watch('name')?.length || 0}/100 characters</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold text-foreground">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="A brief description of the project goals, deliverables, and scope..."
                            {...form.register('description')}
                            maxLength={500}
                            className="bg-card text-foreground border-2 border-border focus:border-primary focus:ring-2 focus:ring-ring transition-all resize-none placeholder:text-muted-foreground"
                            rows={4}
                        />
                        <p className="text-xs text-muted-foreground pl-1">{watch('description')?.length || 0}/500 characters</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="priority" className="text-sm font-semibold text-foreground">Priority</Label>
                        <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger id="priority" className="w-full bg-card text-foreground border-2 border-border focus:border-primary focus:ring-2 focus:ring-ring h-11">
                                        <SelectValue placeholder="Select priority level" />
                                    </SelectTrigger>
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
                            )}
                        />
                    </div>

                    <div className="flex items-start space-x-3 p-4 rounded-lg bg-primary/10 border-2 border-border">
                        <Controller
                            name="isPrivate"
                            control={control}
                            render={({ field }) => (
                                <Switch
                                    id="isPrivate"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-secondary"
                                />
                            )}
                        />
                        <div className="flex-1">
                            <Label htmlFor="isPrivate" className="text-sm font-semibold text-foreground cursor-pointer">Private Project</Label>
                            <p className="text-xs text-muted-foreground mt-1">Only invited members can view and access this project. Public projects are visible to all workspace members.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <Label className="text-sm font-semibold text-foreground">Tags (Optional)</Label>
                            <p className="text-xs text-muted-foreground mt-1">Categorize your project with relevant tags for better organization</p>
                        </div>
                        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted border border-border min-h-[60px]">
                            {availableTags.map(tag => (
                                <Button
                                    key={tag}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                                        selectedTags.includes(tag)
                                            ? 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/40 shadow-md'
                                            : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border'
                                    )}
                                    onClick={() => handleTagClick(tag)}
                                >
                                    {tag}
                                </Button>
                            ))}
                        </div>
                        {selectedTags.length > 0 && (
                            <p className="text-xs text-muted-foreground pl-1">{selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected</p>
                        )}
                    </div>

                    <DialogFooter className="flex justify-end gap-3 pt-6 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
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
                                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                    Creating...
                                </>
                            ) : (
                                "Create Project"
                            )}
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