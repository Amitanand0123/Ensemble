import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { updateProjectSettings} from '../../redux/slices/projectSlice';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';



const ProjectSettings = ({ project }) => {
    const dispatch = useDispatch();
    const [localError, setLocalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
            priority: 'medium',
            endDate: null,
            'settings.isPrivate': false,
            'settings.visibility': 'workspace',
        }
    });
    useEffect(() => {
        if (project) {
            form.reset({
                name: project.name || '',
                description: project.description || '',
                priority: project.priority || 'medium',
                endDate: project.endDate ? new Date(project.endDate) : null,
                'settings.isPrivate': project.settings?.isPrivate || false,
                'settings.visibility': project.settings?.visibility || 'workspace',
            });
            setLocalError('');
        }
    }, [project, form]);

    const onSubmit = async (data) => {
        setLocalError('');
        setIsSubmitting(true);
        const updateData = {
            name: data.name,
            description: data.description,
            priority: data.priority,
            endDate: data.endDate ? data.endDate.toISOString() : null,
            'settings.isPrivate': data['settings.isPrivate'],
            'settings.visibility': data['settings.visibility'],
        };

        try {
            await dispatch(updateProjectSettings({ projectId: project._id, settings: updateData })).unwrap();
            toast.success('Project settings updated successfully!');
        } catch (error) {
            setLocalError(error || 'Failed to update project settings');
            toast.error(`Update failed: ${error || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    if (!project) {
        return <div className="text-foreground p-6">Loading project settings...</div>;
    }

    return (
        <Card className="bg-card backdrop-blur-sm rounded-xl border border-border text-foreground animate-fade-in-up mt-4">
            <CardHeader>
                <CardTitle>Project Settings</CardTitle>
            </CardHeader>
            <CardContent>
                {localError && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/50 text-destructive rounded-md text-sm">
                        Error: {localError}
                    </div>
                )}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter project name"
                                            {...field}
                                            className="bg-muted border-border"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-destructive" />
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
                                            placeholder="Enter project description"
                                            rows={4}
                                            {...field}
                                            className="bg-muted border-border"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-muted border-border w-full">
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-card text-foreground border-border">
                                                <SelectItem value="low">Low</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-destructive" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="settings.visibility"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visibility</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-muted border-border w-full">
                                                    <SelectValue placeholder="Select visibility" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-card text-foreground border-border">
                                                <SelectItem value="workspace">Workspace</SelectItem>
                                                <SelectItem value="members">Members Only</SelectItem>
                                                <SelectItem value="admins">Admins Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-destructive" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>End Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={`w-full md:w-[280px] justify-start text-left font-normal ${!field.value && 'text-muted-foreground'} bg-muted border-border hover:bg-accent`}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-muted border-border" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : null}
                                                onSelect={field.onChange}
                                                initialFocus
                                                className="text-foreground [&_button]:text-foreground [&_button:hover]:bg-accent [&_button[aria-selected]]:bg-primary"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className="text-destructive" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="settings.isPrivate" 
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-muted">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Private Project</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            If enabled, only project members can see this project.
                                        </p>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => form.reset()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

ProjectSettings.propTypes = {
    project: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string,
        description: PropTypes.string,
        priority: PropTypes.oneOf(['low', 'medium', 'high', 'critical']),
        endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        settings: PropTypes.shape({
            isPrivate: PropTypes.bool,
            visibility: PropTypes.oneOf(['workspace', 'members', 'admins']),
            tags: PropTypes.arrayOf(PropTypes.string)
        }),
    }),
};

export default ProjectSettings;