import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorkspaceDetail, deleteWorkspace } from '../../redux/slices/workspaceSlice'; // Import deleteWorkspace
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

const WorkspaceSettings = ({ workspaceId }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize useNavigate for redirection

    const workspace = useSelector(state => state.workspaces.workspaceDetail);

    const [settings, setSettings] = useState({
        name: workspace?.name || '',
        description: workspace?.description || '',
        isPrivate: workspace?.settings?.isPrivate || false,
        joinByCode: workspace?.settings?.joinByCode || true,
        theme: workspace?.settings?.theme || 'light'
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteError, setDeleteError] = useState(''); // Error state for delete

    useEffect(() => {
        if (workspace) {
            setSettings({
                name: workspace.name || '',
                description: workspace.description || '',
                isPrivate: workspace.settings?.isPrivate || false,
                joinByCode: workspace.settings?.joinByCode || true,
                theme: workspace.settings?.theme || 'light'
            });
        }
    }, [workspace]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.patch(`/api/workspaces/${workspaceId}`, settings);
            if (response.data.success) {
                setSuccess('Workspace settings updated successfully');
                dispatch(fetchWorkspaceDetail(workspaceId));
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update settings');
        }
    };

    const handleDeleteWorkspace = async () => {
        setDeleteError(''); // Clear delete error
        if (window.confirm("Are you sure you want to delete this workspace? This action is irreversible!")) { // Confirmation
            try {
                await dispatch(deleteWorkspace(workspaceId)).unwrap();
                alert('Workspace deleted successfully.'); // Success alert
                navigate('/dashboard'); // Redirect to dashboard after deletion
            } catch (deleteErr) {
                setDeleteError(deleteErr.message || 'Failed to delete workspace.'); // Set delete error
            }
        }
    };


    if (!workspace) {
        return <div className="text-white">Loading Settings...</div>; // Keep text white for loading
    }

    return (
        <div className="text-white"> {/* Ensure text is white in settings too */}
            <Card className='bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 animate-fade-in-up'> {/* Card styling to match */}
                <CardHeader>
                    <CardTitle>Workspace Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert>
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Name
                                </label>
                                <Input className="bg-gray-900 text-white" id="name" placeholder="Workspace name" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} /> {/* Input style */}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Description
                                </label>
                                <Textarea className="bg-gray-900 text-white" id="description" placeholder="Workspace description" value={settings.description} onChange={(e) => setSettings({ ...settings, description: e.target.value })} /> {/* Textarea style */}
                            </div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="isPrivate" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Private Workspace
                                </label>
                                <Switch id="isPrivate" checked={settings.isPrivate} onCheckedChange={(checked) => setSettings({ ...settings, isPrivate: checked })} />
                            </div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="joinByCode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Join by Code
                                </label>
                                <Switch id="joinByCode" checked={settings.joinByCode} onCheckedChange={(checked) => setSettings({ ...settings, joinByCode: checked })} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="theme" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Theme
                                </label>
                                <Input className="bg-gray-900 text-white" id="theme" placeholder="Theme" value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} /> {/* Input style */}
                            </div>
                        </div>


                        <Button type="submit">Save Changes</Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 animate-fade-in-up"> {/* Card styling to match */}
                <CardHeader>
                    <CardTitle className="text-red-500">Danger Zone</CardTitle> {/* Danger Zone title in red */}
                </CardHeader>
                <CardContent>
                    {deleteError && ( // Display delete error if any
                        <Alert variant="destructive">
                            <AlertDescription>{deleteError}</AlertDescription>
                        </Alert>
                    )}
                    <Button variant="destructive" onClick={handleDeleteWorkspace}> {/* Destructive button variant for delete */}
                        Delete Workspace
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default WorkspaceSettings;