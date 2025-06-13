import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    fetchWorkspaceDetail,
    deleteWorkspace,
    updateWorkspaceSettings
} from '../../redux/slices/workspaceSlice';
import PropTypes from 'prop-types';



const WorkspaceSettings = ({ workspaceId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const workspace = useSelector(state => state.workspaces.workspaceDetail);
    const { isLoading: isDeleting, error: deleteErrorMsg } = useSelector(state => state.workspaces);

    const [localUpdateError, setLocalUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // Local submitting state for update

    // --- Initialize react-hook-form ---
    const form = useForm({
        // resolver: zodResolver(workspaceSettingsSchema), // Optional
        defaultValues: { // Set initial values
            name: '',
            description: '',
            isPrivate: false,
            joinByCode: true,
            theme: 'light',
        }
    });

    // Effect to reset form when workspace data loads or changes
    useEffect(() => {
        if (workspace && workspace._id === workspaceId) {
            form.reset({ // Update form values using form.reset
                name: workspace.name || '',
                description: workspace.description || '',
                isPrivate: workspace.settings?.isPrivate || false,
                joinByCode: workspace.settings?.joinByCode === undefined ? true : workspace.settings.joinByCode,
                theme: workspace.settings?.theme || 'light'
            });
            setLocalUpdateError('');
            setUpdateSuccess('');
        } else if (workspaceId) {
            dispatch(fetchWorkspaceDetail(workspaceId));
        }
    }, [workspace, workspaceId, dispatch, form]); // Add form dependency

    // Handle form submission for updating settings
    const onSubmit = async (data) => { // Receive validated data from RHF
        setLocalUpdateError('');
        setUpdateSuccess('');
        setIsSubmitting(true);

        // Data is already validated if using resolver
        // Prepare payload (ensure it matches backend expectation)
        const updateData = {
            name: data.name,
            description: data.description,
            isPrivate: data.isPrivate,
            joinByCode: data.joinByCode,
            theme: data.theme,
        };

        try {
            await dispatch(updateWorkspaceSettings({ workspaceId, settings: updateData })).unwrap();
            setUpdateSuccess('Workspace settings updated successfully!');
            toast.success('Settings updated!');
        } catch (updateErr) {
            setLocalUpdateError(updateErr || 'Failed to update settings');
            toast.error(`Update failed: ${updateErr || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle workspace deletion (remains the same)
    const handleDeleteWorkspace = async () => {
        const confirmMessage = `Are you absolutely sure you want to delete the workspace "${workspace?.name || 'this workspace'}"? \n\nThis action is IRREVERSIBLE and will permanently delete all associated projects, tasks, and files.`;
        if (window.confirm(confirmMessage)) {
            try {
                await dispatch(deleteWorkspace(workspaceId)).unwrap();
                toast.success('Workspace deleted successfully.');
                navigate('/dashboard');
            } catch (deleteErr) {
                toast.error(`Delete failed: ${deleteErr || 'Unknown error'}`);
            }
        }
    };

    // Render loading state
    if (!workspace || workspace._id !== workspaceId) {
        return <div className="text-white p-6 animate-pulse">Loading Settings...</div>;
    }

    return (
        <div className="text-white space-y-6">
            {/* Settings Update Card */}
            <Card className='bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 animate-fade-in-up'>
                <CardHeader>
                    <CardTitle>Workspace Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* --- Wrap with Shadcn Form Provider --- */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                            {localUpdateError && (
                                <Alert variant="destructive" className="bg-red-900/30 border-red-700 text-red-300">
                                    <AlertDescription>{localUpdateError}</AlertDescription>
                                </Alert>
                            )}
                            {updateSuccess && (
                                <Alert variant="success" className="bg-green-900/30 border-green-700 text-green-300">
                                    <AlertDescription>{updateSuccess}</AlertDescription>
                                </Alert>
                            )}

                            {/* --- Name (Using FormField) --- */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Workspace name" {...field} className="bg-gray-700 border-gray-600" />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
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
                                            <Textarea placeholder="Workspace description" {...field} className="bg-gray-700 border-gray-600 min-h-[80px]" />
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            />

                            {/* --- Is Private Switch (Using FormField) --- */}
                            <FormField
                                control={form.control}
                                name="isPrivate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-4 bg-gray-900/30">
                                         <div className="space-y-0.5">
                                             <FormLabel className="text-base">Private Workspace</FormLabel>
                                             <p className="text-sm text-gray-400">Only invited members can join.</p>
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

                            {/* --- Join By Code Switch (Using FormField) --- */}
                            <FormField
                                control={form.control}
                                name="joinByCode"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-700 p-4 bg-gray-900/30">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Allow Join via Code</FormLabel>
                                            <p className="text-sm text-gray-400">Allow users to join using the invite code.</p>
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

                            {/* --- Theme Input (Example - Using FormField) --- */}
                            {/* <FormField
                                control={form.control}
                                name="theme"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Theme</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Theme (e.g., light, dark)" {...field} className="bg-gray-700 border-gray-600"/>
                                        </FormControl>
                                        <FormMessage className="text-red-400" />
                                    </FormItem>
                                )}
                            /> */}

                            {/* --- Submit Button --- */}
                            <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90">
                                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : 'Save Changes'}
                            </Button>
                        </form>
                    </Form> {/* --- End Shadcn Form Provider --- */}
                </CardContent>
            </Card>

            {/* Danger Zone Card (remains the same logic using Redux state for delete) */}
            <Card className="mt-6 bg-red-900/20 backdrop-blur-sm rounded-xl border border-red-700/50 animate-fade-in-up">
                <CardHeader>
                    <CardTitle className="text-red-400">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {deleteErrorMsg && (
                        <Alert variant="destructive" className="bg-red-800/50 border-red-600 text-red-200">
                            <AlertDescription>{deleteErrorMsg}</AlertDescription>
                        </Alert>
                    )}
                    <p className="text-sm text-red-200">
                        Deleting this workspace is permanent and cannot be undone. All associated projects, tasks, and files will be lost.
                    </p>
                    <Button variant="destructive" onClick={handleDeleteWorkspace} disabled={isDeleting}>
                        {isDeleting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>) : 'Delete This Workspace'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

WorkspaceSettings.propTypes={
    workspaceId:PropTypes.string.isRequired
}

export default WorkspaceSettings;