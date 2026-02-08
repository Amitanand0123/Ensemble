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
import { Loader2, Copy, Check } from 'lucide-react';
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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);

    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
            isPrivate: false,
            joinByCode: true,
            theme: 'light',
        }
    });

    useEffect(() => {
        if (workspace && workspace._id === workspaceId) {
            form.reset({
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
    }, [workspace, workspaceId, dispatch, form]);

    const onSubmit = async (data) => {
        setLocalUpdateError('');
        setUpdateSuccess('');
        setIsSubmitting(true);

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

    const handleCopyInviteCode = async () => {
        if (workspace?.settings?.inviteCode) {
            try {
                await navigator.clipboard.writeText(workspace.settings.inviteCode);
                setCopied(true);
                toast.success('Invite code copied to clipboard!');
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                toast.error('Failed to copy invite code');
                console.error('Copy failed:', err);
            }
        }
    };

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

    if (!workspace || workspace._id !== workspaceId) {
        return <div className="text-foreground p-6 animate-pulse">Loading Settings...</div>;
    }

    return (
        <div className="text-foreground space-y-6">
            {/* Settings Update Card */}
            <Card className='bg-card backdrop-blur-sm rounded-xl border border-border animate-fade-in-up'>
                <CardHeader>
                    <CardTitle>Workspace Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                            {localUpdateError && (
                                <Alert variant="destructive" className="bg-destructive/5 border-destructive text-destructive">
                                    <AlertDescription>{localUpdateError}</AlertDescription>
                                </Alert>
                            )}
                            {updateSuccess && (
                                <Alert variant="success" className="bg-secondary/10 border-secondary text-secondary">
                                    <AlertDescription>{updateSuccess}</AlertDescription>
                                </Alert>
                            )}

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Workspace name" {...field} className="bg-muted border-border" />
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
                                            <Textarea placeholder="Workspace description" {...field} className="bg-muted border-border min-h-[80px]" />
                                        </FormControl>
                                        <FormMessage className="text-destructive" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isPrivate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-muted/50">
                                         <div className="space-y-0.5">
                                             <FormLabel className="text-base">Private Workspace</FormLabel>
                                             <p className="text-sm text-muted-foreground">Only invited members can join.</p>
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

                            <FormField
                                control={form.control}
                                name="joinByCode"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4 bg-muted/50">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Allow Join via Code</FormLabel>
                                            <p className="text-sm text-muted-foreground">Allow users to join using the invite code.</p>
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

                            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                                {isSubmitting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : 'Save Changes'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Invite Code Card - Only visible if joinByCode is enabled */}
            {workspace?.settings?.joinByCode && workspace?.settings?.inviteCode && (
                <Card className='bg-primary/5 backdrop-blur-sm rounded-xl border border-primary/30 animate-fade-in-up'>
                    <CardHeader>
                        <CardTitle className="text-primary">Workspace Invite Code</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Share this code with others to let them join this workspace.
                        </p>
                        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
                            <code className="flex-1 text-lg font-mono text-primary tracking-wider">
                                {workspace.settings.inviteCode}
                            </code>
                            <Button
                                onClick={handleCopyInviteCode}
                                variant="outline"
                                size="sm"
                                className="border-primary hover:bg-primary/10 text-primary"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy
                                    </>
                                )}
                            </Button>
                        </div>
                        <Alert className="bg-primary/5 border-primary/30 text-primary">
                            <AlertDescription>
                                This code allows anyone who has it to join the workspace. Keep it secure and only share it with trusted members.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}

            <Card className="mt-6 bg-destructive/5 backdrop-blur-sm rounded-xl border border-destructive/30 animate-fade-in-up">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {deleteErrorMsg && (
                        <Alert variant="destructive" className="bg-destructive/10 border-destructive text-destructive">
                            <AlertDescription>{deleteErrorMsg}</AlertDescription>
                        </Alert>
                    )}
                    <p className="text-sm text-destructive">
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