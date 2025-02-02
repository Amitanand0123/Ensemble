import React,{useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { fetchWorkspaces } from '../../redux/slices/workspaceSlice'
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

const WorkspaceSettings=()=>{
    const {id}=useParams()
    const dispatch=useDispatch()
    const workspace=useSelector(state=>state.workspaces.workspaces.find(w=>w._id===id))

    const [settings,setSettings]=useState({
        name:workspace?.name ||'',
        description:workspace?.description||'',
        isPrivate:workspace?.settings?.isPrivate ||false,
        joinByCode:workspace?.settings?.joinByCode ||true,
        theme:workspace?.settings?.theme || 'light'
    })

    const [error,setError]=useState('')
    const [success,setSuccess]=useState('')

    const handleSubmit=async(e)=>{
        e.preventDefault()
        setError('')
        setSuccess('')

        try {
            const response=await axios.patch(`/api/workspaces/${id}`,settings)
            if(response.data.success){
                setSuccess('Workspace settings updated successfully')
                dispatch(fetchWorkspaces())
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update settings')
        }
    }

    if(!workspace) return <div>Loading...</div>

    return(
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
                        <div>
                            <label className='text-sm font-medium'>Workspace Name</label>
                            <Input value={settings.name} onChange={(e)=>setSettings({...settings,name:e.target.value})} maxLength={50} />
                        </div>
                        <div>
                            <label className='text-sm font-medium'>Description</label>
                            <Textarea value={settings.description} onChange={(e)=>setSettings({...settings,description:e.target.value})} maxLength={500} rows={4} />
                        </div>
                        <div> 
                            <div>
                                <label className='text-sm font-medium'>Private Workspace</label>
                                <Switch checked={settings.isPrivate} onCheckedChange={(checked)=>setSettings({...settings,isPrivate:checked})} />
                            </div>
                            <div>
                                <label className=''>Allow Joining by Code</label>
                                <Switch checked={settings.joinByCode} onCheckedChange={(checked)=>setSettings({...settings,joinByCode:checked})} />
                            </div>
                            <div>
                                <label className=''>Theme</label>
                                <select value={settings.theme} onChange={(e)=>setSettings({...settings,theme:e.target.value})} className='w-full p-2 border rounded-md'>
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <Button type="button" variant="outline"
                                onClick={()=>setSettings({
                                    name:workspace.name,
                                    description:workspace.description,
                                    isPrivate:workspace.settings.isPrivate,
                                    joinByCode:workspace.settings.joinByCode,
                                    theme:workspace.settings.theme
                                })}
                            >
                                Reset
                            </Button>
                            <Button type="submit">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <div>
                            <div>
                                <h4>Archive Workspace</h4>
                                <p>
                                    Archive this workspace and all its contents.This action can be reversed.
                                </p>
                            </div>
                            <Button variant="outline" className="text-yellow-600 border-yellow-600">
                                Archive
                            </Button>
                        </div>
                        <div>
                            <div>
                                <h4>Delete Workspace</h4>
                                <p>
                                    Permanently delete this workspace and all its contents.This action cannot be undone.
                                </p>
                            </div>
                            <Button variant="destructive">
                                Delete
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default WorkspaceSettings;
