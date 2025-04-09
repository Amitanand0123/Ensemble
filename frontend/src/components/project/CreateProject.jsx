// frontend/src/components/project/CreateProject.jsx

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// Assuming fetchProjects needs the workspaceId now based on previous changes
import { fetchProjects } from "../../redux/slices/projectSlice"; 
import axios from "axios";
import { Dialog, DialogClose, DialogContent, DialogOverlay, DialogPortal } from "@radix-ui/react-dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { X } from "@radix-ui/react-icons";
import { Label } from "../ui/label"; // Assuming you have a general Label in your ui directory
import { cn } from '../../lib/utils'; // Import your utility function for class names

// --- Define available tags ---
const availableTags = ['Feature', 'Bug', 'Enhancement', 'UI/UX', 'Backend', 'Frontend', 'Documentation', 'Testing'];

const CreateProject = ({ workspaceId, open, onOpenChange }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('low');
    const [isPrivate, setIsPrivate] = useState(false);
    // --- State for selected tags (array) ---
    const [selectedTags, setSelectedTags] = useState([]); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);

    // --- Handler for clicking tag buttons ---
    const handleTagClick = (tag) => {
        setSelectedTags(prevTags => 
            prevTags.includes(tag) 
              ? prevTags.filter(t => t !== tag) // Remove if already selected
              : [...prevTags, tag] // Add if not selected
        );
    };

    // --- Reset form state when modal closes or opens ---
    useState(() => {
        if (!open) {
            setName('');
            setDescription('');
            setPriority('low');
            setIsPrivate(false);
            setSelectedTags([]);
            setError('');
            setSuccess('');
            setIsLoading(false);
        }
    }, [open]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        const projectData = {
            name, 
            description, 
            workspace: workspaceId, 
            priority, 
            settings: {
                isPrivate,
                // --- Use the selectedTags array directly ---
                tags: selectedTags 
            }
        };

        try {
            const response = await axios.post('/api/projects', projectData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setSuccess('Project created successfully!');
                // Dispatch fetchProjects with workspaceId to update the list
                dispatch(fetchProjects(workspaceId)); 
                setTimeout(() => onOpenChange(false), 1500); // Close modal after delay
            } else {
                setError(response.data.message || 'Failed to create project');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error creating project.');
            console.error('Project creation error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gray-800 text-white rounded-md p-6 shadow-lg fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] focus:outline-none w-[90%] max-w-lg max-h-[90vh] overflow-y-auto">
                <Card className="bg-transparent border-none shadow-none animate-fade-in-up"> {/* Simplified card */}
                    <CardHeader className="p-0 mb-4"> {/* Adjusted padding */}
                        <CardTitle className="text-2xl font-bold">Create New Project</CardTitle>
                        <DialogClose asChild>
                           <Button className="absolute top-4 right-4 rounded-full p-0 w-6 h-6" variant="ghost">
                               <X className="h-4 w-4" />
                           </Button>
                       </DialogClose>
                    </CardHeader>
                    <CardContent className="p-0"> {/* Adjusted padding */}
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert variant="success" className="mb-4"> {/* Use success variant if available */}
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Project Name</Label> {/* Use htmlFor */}
                                    <Input
                                        id="name"
                                        placeholder="Enter project name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="bg-gray-900 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Project description (optional)"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="bg-gray-900 text-white min-h-[80px]" // Set min-height
                                        rows={3} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <select
                                        id="priority"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full bg-gray-900 text-white rounded-md border border-gray-700 px-3 py-2 focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option> {/* Added critical */}
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isPrivate"
                                        className="rounded-sm text-purple-500 focus:ring-purple-500 bg-gray-900 border-gray-700 h-4 w-4" // Adjusted size
                                        checked={isPrivate}
                                        onChange={(e) => setIsPrivate(e.target.checked)}
                                    />
                                    <Label htmlFor="isPrivate" className="text-sm">Private Project</Label> {/* Slightly smaller label */}
                                </div>

                                {/* --- Tags Section --- */}
                                <div className="space-y-2">
                                    <Label>Tags</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map(tag => (
                                            <Button
                                                key={tag}
                                                type="button" // Important: prevent form submission
                                                variant={selectedTags.includes(tag) ? 'default' : 'outline'} // Style based on selection
                                                size="sm" // Smaller buttons
                                                className={cn(
                                                    "rounded-full px-3 py-1 text-xs", // Base styles
                                                    selectedTags.includes(tag) 
                                                      ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600' 
                                                      : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                                                )}
                                                onClick={() => handleTagClick(tag)}
                                            >
                                                {tag}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                {/* --- End Tags Section --- */}

                            </div>
                            <CardFooter className="p-0 pt-4 justify-end space-x-3"> {/* Adjusted padding and alignment */}
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90">
                                    {isLoading ? "Creating..." : "Create Project"}
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </DialogContent>
            <DialogOverlay className="bg-black/80 fixed inset-0 animate-overlayShow" />
             {/* Remove DialogPortal and explicit DialogClose if using Radix default closing */}
        </Dialog>
    );
};

export default CreateProject;