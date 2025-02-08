import React,{useState} from 'react'
import {useTasks} from '../../hooks/useTasks'
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogFooter} from '../ui/dialog'
import { Calendar } from 'lucide-react'




const CreateTask=({projectId,task=null,onClose})=>{
    const {createTask,updateTask}=useTasks(projectId)
    const [isLoading,setIsLoading]=useState(false)
    const [formData,setFormData]=useState({
        title:task?.title || '',
        description:task?.description || '',
        status:task?.status||'todo',
        priority:task?.priority||'medium',
        dueDate:task?.dueDate?new Date(task?.dueDate):null,
    })

    const handleSubmit=async(e)=>{
        e.preventDefault()
        setIsLoading(true)

        try {
            if(task){
                await updateTask(task._id,formData)
            }
            else{
                await createTask({
                    ...formData,
                    project:projectId,
                })
            }
            onClose()
        } catch (error) {
            console.error('Failed to save task:',error)
        } finally{
            setIsLoading(false)
        }
    }

    return (
        <Dialog>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {task?'Edit Task':'Create New Task'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <FormField name="title" render={()=>(
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter task title" value={formData.title} onChange={(e)=>setFormData({...formData,title:e.target.value})} className="w-full" />
                            </FormControl>
                        </FormItem>
                    )} />
                    <FormField name="description" render={()=>(
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <TextArea placeholder="Enter task description" value={formData.description} onChange={(e)=>setFormData({...formData,description:e.target.value})} className=",in-h-[100px]" />
                            </FormControl>
                        </FormItem>
                    )} />
                    <div>
                        <FormField name="status" render={()=>(
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">To DO</SelectItem>
                                        <SelectItem value="inProgress">In Progress</SelectItem>
                                        <Selectitem value="completed">Completed</Selectitem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )} />
                        <FormField name="priority" render={()=>(
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <Select value={formData.priority} onValueChange={(value)=>setFormData({...formData,priority:value})} >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <Selectitem value="high">High</Selectitem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )} />
                    </div>
                    <FormField name="dueDate" render={()=>(
                        <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild> 
                                    <Button>
                                        <Calendar />
                                        {formData.dueDate? format(formData.dueDate,"PPP"):"Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <CalendarComponent mode="single" selected={formData.dueDate} onSelect={(date)=>setFormData({...formData,dueDate:date})} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </FormItem>
                    )} />
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading?'Saving...':task?'Update Task':'Create Task'}
                        </Button>
                    </DialogFooter>
                </form> 
            </DialogContent>
        </Dialog>
    )
}

export default CreateTask;
