import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import axios from 'axios';
import PropTypes from 'prop-types';

const ProjectSettings = ({ project }) => {
    const [formData, setFormData] = useState({
        name: project.name,
        description: project.description,
        priority: project.priority,
        endDate: project.endDate ? new Date(project.endDate) : null,
        settings: {
            isPrivate: project.settings?.isPrivate || false,
            visibility: project.settings?.visibility || 'workspace',
            tags: project.settings?.tags || []
        }
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await axios.patch(`/api/projects/${project._id}`, formData);
            // You might want to add a success notification here
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update project settings');
            console.error('Failed to update project settings:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField
                        name="name"
                        render={() => (
                            <FormItem>
                                <FormLabel>Project Name</FormLabel>
                                <FormControl>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter project name"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="description"
                        render={() => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={4}
                                        placeholder="Enter project description"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            name="priority"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Priority</FormLabel>
                                    <Select
                                        value={formData.priority}
                                        onValueChange={(value) => setFormData({ ...formData, priority: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="critical">Critical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="visibility"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Visibility</FormLabel>
                                    <Select
                                        value={formData.settings.visibility}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                settings: { ...formData.settings, visibility: value }
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select visibility" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="workspace">Workspace</SelectItem>
                                            <SelectItem value="members">Members Only</SelectItem>
                                            <SelectItem value="admins">Admins Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        name="endDate"
                        render={() => (
                            <FormItem className="flex flex-col">
                                <FormLabel>End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`w-[280px] justify-start text-left font-normal ${
                                                !formData.endDate && 'text-muted-foreground'
                                            }`}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.endDate ? format(formData.endDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={formData.endDate}
                                            onSelect={(date) => setFormData({ ...formData, endDate: date })}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )}
                    />

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

ProjectSettings.propTypes = {
    project: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        priority: PropTypes.oneOf(['low', 'medium', 'high', 'critical']).isRequired,
        endDate: PropTypes.string, // ISO date string
        settings: PropTypes.shape({
            isPrivate: PropTypes.bool,
            visibility: PropTypes.oneOf(['workspace', 'members', 'admins']),
            tags: PropTypes.arrayOf(PropTypes.string)
        }),
    }).isRequired,
};

export default ProjectSettings;