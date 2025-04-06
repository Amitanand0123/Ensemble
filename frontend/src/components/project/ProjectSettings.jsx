// src/components/project/ProjectSettings.jsx

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form'; // Import useForm
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
// Import Shadcn Form components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { updateProjectSettings, fetchProjectDetail } from '../../redux/slices/projectSlice';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';
// Optional: If using Zod for validation
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';

// Optional: Define a Zod schema for validation
// const projectSettingsSchema = z.object({
//     name: z.string().min(3, { message: "Project name must be at least 3 characters." }).max(100),
//     description: z.string().max(1000).optional(),
//     priority: z.enum(['low', 'medium', 'high', 'critical']),
//     endDate: z.date().nullable().optional(),
//     'settings.isPrivate': z.boolean(),
//     'settings.visibility': z.enum(['workspace', 'members', 'admins']),
//     // 'settings.tags': z.array(z.string()).optional(), // Example if tags were editable
// });


const ProjectSettings = ({ project }) => {
    const dispatch = useDispatch();
    const [localError, setLocalError] = useState(''); // For backend errors
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Initialize react-hook-form ---
    const form = useForm({
        // resolver: zodResolver(projectSettingsSchema), // Optional: Add resolver
        defaultValues: { // Set initial values when form mounts
            name: '',
            description: '',
            priority: 'medium',
            endDate: null,
            'settings.isPrivate': false,
            'settings.visibility': 'workspace',
            // 'settings.tags': [],
        }
    });

    // Effect to reset form values when the 'project' prop changes
    useEffect(() => {
        if (project) {
            form.reset({ // Use form.reset to update defaultValues reactively
                name: project.name || '',
                description: project.description || '',
                priority: project.priority || 'medium',
                endDate: project.endDate ? new Date(project.endDate) : null,
                'settings.isPrivate': project.settings?.isPrivate || false,
                'settings.visibility': project.settings?.visibility || 'workspace',
                // 'settings.tags': project.settings?.tags || [],
            });
            setLocalError(''); // Clear previous errors
        }
    }, [project, form]); // Add form as dependency for form.reset

    // --- Form Submission Handler ---
    const onSubmit = async (data) => { // data is validated form values from react-hook-form
        setLocalError('');
        setIsSubmitting(true);

        // Prepare data payload matching backend expectations
        const updateData = {
            name: data.name,
            description: data.description,
            priority: data.priority,
            endDate: data.endDate ? data.endDate.toISOString() : null,
            'settings.isPrivate': data['settings.isPrivate'],
            'settings.visibility': data['settings.visibility'],
            // 'settings.tags': data['settings.tags'], // Include if needed
        };

        try {
            await dispatch(updateProjectSettings({ projectId: project._id, settings: updateData })).unwrap();
            toast.success('Project settings updated successfully!');
            // Optionally refetch details
            // dispatch(fetchProjectDetail(project._id));
        } catch (error) {
            setLocalError(error || 'Failed to update project settings');
            toast.error(`Update failed: ${error || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state based on project prop
    if (!project) {
        return <div className="text-white p-6">Loading project settings...</div>;
    }

    return (
        <Card className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 text-white animate-fade-in-up mt-4">
            <CardHeader>
                <CardTitle>Project Settings</CardTitle>
            </CardHeader>
            <CardContent>
                {localError && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded-md text-sm">
                        Error: {localError}
                    </div>
                )}

                {/* --- Wrap form content with Shadcn Form Provider --- */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* --- Project Name (Using FormField) --- */}
                        <FormField
                            control={form.control}
                            name="name" // Matches key in defaultValues/schema
                            render={({ field }) => ( // 'field' contains { onChange, onBlur, value, name, ref }
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter project name"
                                            {...field} // Spread field props onto the Input
                                            className="bg-gray-700 border-gray-600"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" /> {/* Shows validation errors */}
                                </FormItem>
                            )}
                        />

                        {/* --- Description (Using FormField) --- */}
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
                                            {...field} // Spread field props
                                            className="bg-gray-700 border-gray-600"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />

                        {/* --- Priority & Visibility Grid --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Priority (Using FormField) */}
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-gray-700 border-gray-600 w-full">
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

                            {/* Visibility (Using FormField) */}
                            <FormField
                                control={form.control}
                                name="settings.visibility" // Use dot notation for nested fields
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Visibility</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-gray-700 border-gray-600 w-full">
                                                    <SelectValue placeholder="Select visibility" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-gray-700 text-white border-gray-600">
                                                <SelectItem value="workspace">Workspace</SelectItem>
                                                <SelectItem value="members">Members Only</SelectItem>
                                                <SelectItem value="admins">Admins Only</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* --- End Date (Using FormField) --- */}
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
                                                    className={`w-full md:w-[280px] justify-start text-left font-normal ${!field.value && 'text-muted-foreground'} bg-gray-700 border-gray-600 hover:bg-gray-600`}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(new Date(field.value), 'PPP') : <span>Pick a date</span>}
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-gray-700 border-gray-600" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : null}
                                                onSelect={field.onChange} // RHF's onChange handles the date object
                                                initialFocus
                                                className="text-white [&_button]:text-white [&_button:hover]:bg-gray-600 [&_button[aria-selected]]:bg-blue-600"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className="text-red-400" />
                                </FormItem>
                            )}
                        />

                        {/* --- Is Private Switch (Using FormField) --- */}
                        <FormField
                            control={form.control}
                            name="settings.isPrivate" // Dot notation for nested field
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-4 bg-gray-900/30">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Private Project</FormLabel>
                                        <p className="text-sm text-gray-400">
                                            If enabled, only project members can see this project.
                                        </p>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value} // Use field.value for checked state
                                            onCheckedChange={field.onChange} // Use field.onChange for state update
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* --- Action Buttons --- */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => form.reset()}> {/* Reset form on Cancel */}
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90">
                                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Form> {/* --- End Shadcn Form Provider --- */}
            </CardContent>
        </Card>
    );
};

// PropType definition (remains the same)
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