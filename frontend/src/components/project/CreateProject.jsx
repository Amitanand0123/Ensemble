import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchProjects } from "../../redux/slices/projectSlice"
import axios from "axios"
import { Dialog, DialogClose, DialogContent, DialogOverlay, DialogPortal } from "@radix-ui/react-dialog"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Alert, AlertDescription } from "../ui/alert"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { X } from "@radix-ui/react-icons"
import { Label } from "../ui/label" // Assuming you have a general Label in your ui directory

const CreateProject = ({ workspaceId, open, onOpenChange }) => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState('low')
    const [isPrivate, setIsPrivate] = useState(false)
    const [tags, setTags] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const dispatch = useDispatch()
    const token = useSelector((state) => state.auth.token)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setIsLoading(true)

        const projectData = {
            name, description, workspace: workspaceId, priority, settings: {
                isPrivate,
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            }
        }

        try {
            const response = await axios.post('http://localhost:5000/api/projects', projectData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            if (response.data.success) {
                setSuccess('Project created successfully!')
                dispatch(fetchProjects())
                onOpenChange(false)
            }
            else {
                setError(response.data.message || 'Failed to create project')
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error creating project.')
            console.error('Project creation error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-gray-800 text-white rounded-md p-6 shadow-lg fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] focus:outline-none">
                <Card className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 animate-fade-in-up">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Create New Project</CardTitle> {/* Changed Title to "Project" */}
                    </CardHeader>
                    <CardContent>
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
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Project Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter project name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="bg-gray-900 text-white" // Keep consistent input styling
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Project description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="bg-gray-900 text-white" // Keep consistent textarea styling
                                        rows={4} // Added rows to match Textarea in CreateWorkspace, adjust as needed
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority</Label>
                                    <select
                                        id="priority"
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full bg-gray-900 text-white rounded-md border border-gray-700 px-3 py-2 focus:outline-none focus:border-purple-500" // Keep consistent select styling
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="isPrivate"
                                        className="rounded-sm text-purple-500 focus:ring-purple-500 bg-gray-900 border-gray-700" // Keep consistent checkbox styling
                                        checked={isPrivate}
                                        onChange={(e) => setIsPrivate(e.target.checked)}
                                    />
                                    <Label htmlFor="isPrivate">Private Project</Label>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                                    <Input
                                        type="text"
                                        id="tags"
                                        placeholder="e.g., feature, bug, enhancement"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        className="bg-gray-900 text-white" // Keep consistent input styling
                                    />
                                </div>
                            </div>
                            <CardFooter className="justify-between"> {/* Added justify-between to CardFooter for button alignment */}
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}> {/* Cancel Button */}
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading} className="ml-auto" >
                                    {isLoading ? "Creating..." : "Create Project"}
                                </Button>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </DialogContent>
            <DialogOverlay className="bg-black/80 fixed inset-0 animate-overlayShow" />
            <DialogPortal>
                <DialogClose asChild>
                    <Button className="absolute top-2 right-2 rounded-sm focus:shadow-outline" variant="second">
                        <X className="h-4 w-4" />
                    </Button>
                </DialogClose>
            </DialogPortal>
        </Dialog>
    )
}

export default CreateProject;