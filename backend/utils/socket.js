import {Server} from 'socket.io'
import {verifySocketToken} from '../middlewares/socketAuth.js'
import Task from '../models/Task.js'
import Project from '../models/Project.js'
import Workspace from '../models/Workspace.js'
import Chat from '../models/Chat.js'
import {uploadToCloud} from './fileUpload.js'

export const setupSocketIO=(server)=>{
    const io=new Server(server,{
        cors:{
            origin:process.env.FRONTEND_URL,
            methods:["GET","POST"],
            credentials:true
        }
    })

    const onlineUsers=new Map()
 
    io.use(verifySocketToken)

    io.on('connection',async (socket)=>{
        const userId=socket.user._id
        console.log('User connected:',userId)
        onlineUsers.set(userId.toString(),socket.id)
        socket.join(userId.toString()) //to join the user's room

        const userProjects=await Project.find({'members.user':userId})
        userProjects.forEach(project=>{
            socket.join(`project:${project._id}`)
        })

        const userWorkspaces=await Workspace.find({'members.user':userId})
        userWorkspaces.forEach(workspace=>{
            socket.join(`workspace:${workspace._id}`)
        })

        socket.broadcast.emit('userStatusChanged',{
            userId:userId,
            status:'online'
        })


        socket.on('taskUpdate',async (data)=>{
            try {
                const {taskId,update}=data;
                const task=await Task.findById(taskId).populate('assignedTo','email');
                if(!task){
                    return socket.emit('taskError',{message:'Task not found'})
                }
                if(task.assignedTo){
                    io.to(task.assignedTo._id.toString()).emit('taskUpdated',{
                        message:`Task "${task.title}" has been updated`,
                        update,
                    })
                }
            } catch (error) {
                socket.emit('taskError',{message:'Could not update task'})        
            }
        })

        socket.on('setStatus',(status)=>{
            socket.user.status=status;
            socket.broadcast.emit('userStatusChanged',{
                userId:userId,
                status:status
            })
        })

        socket.on('sendPersonalMessage',async(data,callback)=>{
            const userId=socket.user._id
            try {
                const {receiverId,content,attachments=[]}=data;
                const validAttachments=attachments.map(att=>({
                    filename:att.filename,
                    url:att.url,
                    public_id:att.public_id,
                    mimetype:att.mimetype,
                    size:att.size,
                    uploadedBy:userId,
                    uploadedAt:new Date()
                }))
                const message=new Chat({
                    sender:userId,
                    receiver:receiverId,
                    content,
                    type:'personal',
                    attachments:validAttachments,
                    readBy:[{user:userId,readAt:new Date()}]
                })
                await message.save()
                await message.populate('sender','name avatar')
                await message.populate('attachments.uploadedBy','name avatar')
                io.to(receiverId.toString()).emit('newPersonalMessage',message)
                if(callback){
                    callback({
                        success:true,
                        data:message
                    })
                }
                // socket.emit('messageSent',message);
                // const receiverSocketId=onlineUsers.get(receiverId.toString())
            } catch (error) {
                console.error('[Socket Event: sendPersonalMessage] Error:',error)
                if(callback){
                    callback({
                        success:false,
                        error:'Could not send personal message'
                    })
                }
                // socket.emit('chatError',{message:'Could not send message'})
            }
        })

        socket.on('sendProjectMessage',async(data,callback)=>{
            const userId=socket.user._id;
            try {
                const {projectId,content,attachments=[]}=data
                const project=await Project.findById(projectId)
                if(!project || !project.isMember(userId)){
                    if(callback){
                        return callback({
                            success:false,
                            error:'Not authorized'
                        })
                    }
                    return ;
                    // return socket.emit('chatError',{message:'Not authorized'})
                }

                const validAttachments=attachments.map(att=>({
                    filename:att.filename,
                    url:att.url,
                    public_id:att.public_id,
                    mimetype:att.mimetype,
                    size:att.size,
                    uploadedBy:userId,
                    uploadedAt:new Date()
                }))

                const message=new Chat({
                    sender:userId,
                    project:projectId,
                    content,
                    type:'project',
                    attachments:validAttachments,
                    readBy:[{user:userId,readAt:new Date()}]
                })

                await message.save()
                await message.populate('sender','name avatar')
                io.to(`project:${projectId}`).emit('newProjectMessage',message)
                if(callback){
                    callback({
                        success:true,
                        data:message
                    })
                }
            } catch (error) {
                console.error('[Socket Event: sendProjectMessage] Error:',error);
                if(callback){
                    callback({
                        success:false,
                        error:'Could not send project message due to server error'
                    })
                }
                // socket.emit('chatError',{message:'Could not send message'})
            }
        })

        socket.on('sendWorkspaceMessage',async(data,callback)=>{
            const userId=socket.user._id;
            try {
                const {workspaceId,content,attachments=[]}=data
                console.log(`[Socket Event: sendWorkspaceMessage] Received for workspace ${workspaceId} from user ${userId}`)
                console.log(workspaceId,content,attachments)
                const workspace=await Workspace.findById(workspaceId)
                if(!workspace || !workspace.isMember(userId)){
                    console.error(`[Socket Event: sendWorkspaceMessage] Unauthorized attempt by user ${userId} for workspace ${workspaceId}`)
                    if(callback){
                        return callback({
                            success:false,
                            error:'Not authorized to send message in this workspace'
                        })
                    }
                    return;
                    // return socket.emit('chatError',{message:'Not authorized'})
                }
                const validAttachments=attachments.map(att=>({
                    filename:att.filename,
                    url:att.url,
                    public_id:att.public_id,
                    mimetype:att.mimetype,
                    size:att.size,
                    uploadedBy:userId,
                    uploadedAt:new Date()
                }))
                // const isuserMember=workspace.isMember(userId)
                // console.log(`[Socket Event: sendWorkspaceMessage] user ${userId} isMember of workspace ${workspaceId}? ${isuserMember}`)
                // if(!isuserMember){
                //     console.error(`[Socket Event: sendWorkspaceMessage] Unauthorized attempt by user ${userId} for workspace ${workspaceId}`)
                //     if(callback){
                //         callback({
                //             success:false,
                //             error:'Not authorized to send message in this workspace'
                //         })
                //     }
                //     return;
                //     // return socket.emit('chatError',{message:'Not authorized'})
                // }
                const message=new Chat({
                    sender:userId,
                    workspace:workspaceId,
                    content,
                    type:'workspace',
                    attachments:validAttachments,
                    readBy:[{user:userId,readAt:new Date()}]
                })
                await message.save()
                await message.populate('sender','name avatar')
                await message.populate('attachments.uploadedBy','name avatar')
                io.to(`workspace:${workspaceId}`).emit('newWorkspaceMessage',message)
                console.log(`[Socket Event: sendWorkspaceMessage] Message sent to workspace room: ${workspaceId}`)
                if(callback){
                    callback({
                        success:true,
                        data:message
                    })
                }
            } catch (error) {
                console.error('[Socket Event: sendWorkspaceMessage] Error:',error)
                if(callback){
                    callback({
                        success:false,
                        error:'Could not send message due to server error'
                    })
                }
                // socket.emit('chatError',{message:'Could not send message'})
            }
        })

        socket.on('typing',(data)=>{
            const {receiverId,projectId,workspaceId,isTyping}=data
            if(workspaceId){
                io.to(`workspace:${workspaceId}`).emit('userTyping',{
                    userId,
                    isTyping
                })
            }
            else if(projectId){
                io.to(`project:${projectId}`).emit('userTyping',{
                    userId,
                    isTyping
                })
            }
            else if(receiverId){
                socket.to(receiverId.toString()).emit('userTyping',{
                    userId,
                    isTyping
                })
            }
        })

        socket.on('disconnect',()=>{
            console.log(`User disconnected: ${userId}`)
            onlineUsers.delete(userId.toString())
            socket.broadcast.emit('userStatusChanged',{
                userId:userId,
                status:'offline'
            })
        })
    })
    return io;
}
