import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createWorkspace } from '../../redux/slices/workspaceSlice';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Alert, AlertDescription } from '../ui/alert';
import { Label } from '../ui/label';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const CreateWorkspace = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector(state => state.workspaces);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPrivate: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Workspace name is required');
            return;
        }

        try {
            await dispatch(createWorkspace(formData)).unwrap();
            toast.success('Workspace created successfully!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.message || 'Failed to create workspace. Please try again.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSwitchChange = (checked) => {
        setFormData(prev => ({ ...prev, isPrivate: checked }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <Card className="w-full max-w-lg bg-gray-800/50 border-gray-700 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl">Create New Workspace</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error.message || error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="name">Workspace Name*</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} maxLength={50} placeholder="Enter workspace name" required className="bg-gray-700 border-gray-600" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} maxLength={500} placeholder="A brief description of your workspace" rows={4} className="bg-gray-700 border-gray-600" />
                        </div>
                        <div className="flex items-center space-x-3 pt-2">
                            <Switch id="isPrivate" checked={formData.isPrivate} onCheckedChange={handleSwitchChange} />
                            <Label htmlFor="isPrivate">Private Workspace</Label>
                        </div>
                        <p className="text-xs text-gray-400 pl-1">If private, members can only join via invitation.</p>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleSubmit} disabled={isLoading} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90">
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                        {isLoading ? "Creating..." : "Create Workspace"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default CreateWorkspace;