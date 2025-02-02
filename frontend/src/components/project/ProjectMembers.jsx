import React, { useState } from 'react'
import { useProjects } from '../../hooks/useProjects'
import { Button, Card, CardContent, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Users } from 'lucide-react'
import axios from 'axios'


const ProjectMembers=({project})=>{
    const [showInviteModal,setShowInviteModal]=useState(false)
    const [email,setEmail]=useState('')
    const [role,setRole]=useState('member')

    const handleInvite=async()=>{
        try {
            await axios.post(`/api/projects/${project._id}/invite`,{email,role})
            setShowInviteModal(false)
            setEmail('')
            setRole('member')
        } catch (error) {
            console.error('Failed to invite member:',error)
        }
    }

    return (
        <div>
            <div>
                <h2>Project Members</h2>
                <Button onClick={()=>setShowInviteModal(true)} >
                    <Users className='' />
                    Invite Member
                </Button>
            </div>
            <div>
                {project.members?.map((member)=>(
                    <Card key={member.user._id} >
                        <CardContent>
                            <div>
                                <div>
                                    {member.user.name[0]}
                                </div>
                                <div>
                                    <p>{member.user.name}</p>
                                    <p>{member.user.enail}</p>
                                </div>
                            </div>
                            <div>
                                <span>{member.role}</span>
                                <span>{member.status}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Dialog>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                    </DialogHeader>
                    <div>
                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Enter email address" />
                        </div>
                        <div>
                            <Label htmlFor="role" >Role</Label>
                            <Select value={role} onValueChange={setRole} >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin" >Admin</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={()=>setShowInviteModal(false)} >
                            Cancel
                        </Button>
                        <Button onClick={handleInvite} >Sennd Invitation</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ProjectMembers;