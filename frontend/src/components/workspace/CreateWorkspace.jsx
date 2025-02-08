import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspaces } from '../../hooks/useWorkspaces'
import {Card,CardHeader,CardTitle,CardContent} from '../ui/card'
import {Button} from '../ui/button'
import {Input} from '../ui/input'
import {Textarea} from '../ui/textarea'
import {Switch} from '../ui/switch'
import {Alert,AlertDescription} from '../ui/alert'

const CreateWorkspace=()=>{
    const navigate=useNavigate()
    const {createNewWorkspace}=useWorkspaces()
    const [error,setError]=useState('')
    const [formData,setFormData]=useState({
        name:'',
        description:'',
        isPrivate:false
    })

    const handleSubmit=async(e)=>{
        e.preventDefault()
        setError('')
        if(!formData.name.trim()){
            setError('Workspace name is required')
            return
        }

        const success=await createNewWorkspace(formData)
        if(success){
            navigate('/dashbaord')
        }
        else{
            setError('Failed to create workspace.Please try again')
        }
    }

    const handleChange=(e)=>{
        const {name,value,type,checked}=e.target
        setFormData(prev=>({
            ...prev,
            [name]:type==='checkbox'?checked:value
        }))
    }

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Workspace</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        {error &&(
                            <Alert>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div>
                            <label>Workspace Name</label>
                            <Input name="name" value={formData.name} onChange={handleChange} maxLength={50} placeholder="Enter workspace name" />
                        </div>
                        <div>
                            <label className='text-sm font-medium'>Description</label>
                            <Textarea name="description" value={formData.description} onChange={handleChange} maxLength={500} placeholder="Enter workspace description" rows={4} />
                        </div>
                        <div>
                            <label className=''>Private Workspace</label>
                            <Switch name="isPrivate" checked={formData.isPrivate} onCheckedChange={(checked)=>setFormData(prev=>({...prev,isPrivate:checked}))} />
                        </div>
                        <div>
                            <Button type="button" variant="outline" onClick={()=>navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                Create Workspace
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default CreateWorkspace;