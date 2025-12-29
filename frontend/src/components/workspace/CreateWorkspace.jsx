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
            const result = await dispatch(createWorkspace(formData)).unwrap();
            console.log(result);
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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-2xl bg-card border-2 border-border shadow-2xl slack-hover-lift">
                <form onSubmit={handleSubmit}>
                    <CardHeader className="space-y-1 pb-6 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-chart-1 to-chart-3 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <CardTitle className="text-3xl font-bold text-foreground">Create New Workspace</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Set up a collaborative space for your team</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className='space-y-6'>
                            {error && (
                                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                                    <AlertDescription className="text-destructive">{error.message || error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-foreground">Workspace Name*</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    maxLength={50}
                                    placeholder="e.g., Marketing Team, Engineering Hub"
                                    required
                                    className="bg-input border-2 border-border focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all h-12 text-base"
                                />
                                <p className="text-xs text-muted-foreground pl-1">{formData.name.length}/50 characters</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-semibold text-foreground">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    maxLength={500}
                                    placeholder="A brief description of your workspace's purpose and goals..."
                                    rows={5}
                                    className="bg-input border-2 border-border focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                                />
                                <p className="text-xs text-muted-foreground pl-1">{formData.description.length}/500 characters</p>
                            </div>
                            <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30 border-2 border-border">
                                <Switch
                                    id="isPrivate"
                                    checked={formData.isPrivate}
                                    onCheckedChange={handleSwitchChange}
                                    className="data-[state=checked]:bg-secondary"
                                />
                                <div className="flex-1">
                                    <Label htmlFor="isPrivate" className="text-sm font-semibold text-foreground cursor-pointer">Private Workspace</Label>
                                    <p className="text-xs text-muted-foreground mt-1">Members can only join via invitation link. Public workspaces allow anyone to discover and join.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-3 pt-6 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                            disabled={isLoading}
                            className="px-6 h-11 border-2 hover:bg-accent"
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
                                "Create Workspace"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default CreateWorkspace;