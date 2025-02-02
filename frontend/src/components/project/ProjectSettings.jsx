import React, { useState } from 'react'


const ProjectSettings=({project})=>{
    const [formData,setFormData]=useState({
        name:project.name,
        description:project.description,
        priority:project.priority,
        endDate:new Date(project.endDate),
        settings:{
            isPrivate:project.settings?.isPrivate||false,
            visibility:project.settings?.visibility||'workspace',
            tags:project.settings?.tags||[]
        }
    })

    const handleSubmit=async(e)=>{
        e.preventDefault();
        try {
            await axios.patch(`/api/projects/${project._id}`,formData)
        } catch (error) {
            console.error('Failed to update project settings:',error)
        }
    }

    return (
        <form onSubmit={handleSubmit} >
            <div>
                <FormField name="name" render={()=>(
                    <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                            <Input value={formData.name} onChange={(e)=>setFormData({...formData,name:e.target.value})} />
                        </FormControl>
                    </FormItem>
                )} />

                <FormField name="description" render={()=>(
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <TextArea value={formData.description} onChange={(e)=>setFormData({...formData,description:e.target.value})} rows={4} />
                        </FormControl>
                    </FormItem>
                )} />
                <div>
                    <FormField name="priority" render={()=>(
                        <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select value={formData.priority} onValueChange={(value)=>setFormData({...formData,priority:value})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low" >Low</SelectItem>
                                    <SelectItem value="medium" >Medium</SelectItem>
                                    <Selectitem value="high" >High</Selectitem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )} />
                    <FormField  name="visibility" render={()=>(
                        <FormItem>
                            <FormLabel>Visibility</FormLabel>
                            <Select value={formData.settings.visibility} onValueChange={(value)=>setFormData({...formData,settings:{...formData.settings,visibility:value}})} >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="private" >Private</SelectItem>
                                    <SelectItem value="workspace">Workspace</SelectItem>
                                    <SelectItem value="public">Public</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}/> 
                </div>
                <FormField name="endDate" render={()=>(
                    <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button>
                                    <Calendar />
                                    {format(formData.endDate,'PPP')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={formData.endDate} onSelect={(date)=>setFormData({...formData,endDate:date})} />
                            </PopoverContent>
                        </Popover>
                    </FormItem>
                )} />
            </div>
            <div>
                <Button type="button" variant="outline" >
                    Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
            </div>
        </form>
    )
}

export default ProjectSettings;