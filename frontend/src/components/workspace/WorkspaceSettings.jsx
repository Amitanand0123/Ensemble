import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorkspaceDetail } from '../../redux/slices/workspaceSlice'; // Keep import of fetchWorkspaceDetail for refresh after update
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';

const WorkspaceSettings = ({ workspaceId }) => {
    const dispatch = useDispatch();

    // Directly select workspaceDetail from Redux state
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
                dispatch(fetchWorkspaceDetail(workspaceId)); // Refresh workspaceDetail after update
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update settings');
        }
    };

    if (!workspace) {
        return <div>Loading Settings...</div>;
    }

    return (
        <div>
            <Card>
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
                                <Input id="name" placeholder="Workspace name" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Description
                                </label>
                                <Textarea id="description" placeholder="Workspace description" value={settings.description} onChange={(e) => setSettings({ ...settings, description: e.target.value })} />
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
                                <Input id="theme" placeholder="Theme" value={settings.theme} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} />
                            </div>
                        </div>


                        <Button type="submit">Save Changes</Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Danger zone content... */}
                    <div>Danger Zone Content Here</div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WorkspaceSettings;