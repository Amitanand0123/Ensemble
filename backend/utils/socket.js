import {Server} from 'socket.io'
import {verifySocketToken} from '../middlewares/socketAuth.js'
import Task from '../models/Task.js'
import Project from '../models/Project.js'
import Workspace from '../models/Workspace.js'
import Chat from '../models/Chat.js'

export const setupSocketIO=(server)=>{
    const io=new Server(server,{ // Attaches Socket.IO to your existing HTTP server.
        cors:{
            origin:process.env.FRONTEND_URL || 'http://localhost:5173',
            methods:["GET","POST"],
            credentials:true
        }
    })

    const onlineUsers=new Map()
    console.log("[Socket Setup] Applying 'verifySocketToken' middleware to all incoming connections.");
    io.use(verifySocketToken)

    io.on('connection',async (socket)=>{ // This runs when a user connects.
        const userId=socket.user._id
        console.log(`[Socket Connection] ✅ User connected: ${socket.user.email} (ID: ${userId})`);
        onlineUsers.set(userId.toString(),socket.id)
        socket.join(userId.toString()) // This line tells Socket.IO to join the current socket to a private room named after the user's ID.

        const userWorkspaces = await Workspace.find({ 'members.user': userId });
        userWorkspaces.forEach(workspace => {
            socket.join(`workspace:${workspace._id}`);
            console.log(`[Socket Connection] User ${socket.user.email} joined workspace room: ${workspace._id}`);
        });
        const userProjects = await Project.find({ 'members.user': userId });
        userProjects.forEach(project => {
            socket.join(`project:${project._id}`);
        });

        socket.broadcast.emit('userStatusChanged',{ // This broadcasts an event named 'userStatusChanged' to all connected sockets except the one that triggered it. It tells other users:“Hey, this user is now online!”
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
                    io.to(task.assignedTo._id.toString()).emit('taskUpdated',{ // Emits a taskUpdated event to the socket room matching the assigned user's ID.
                        message:`Task "${task.title}" has been updated`,
                        update,
                    })
                }
            } catch (error) {
                console.error('Task update error:',error)
                socket.emit('taskError',{message:'Could not update task'})        
            }
        })

        socket.on('setStatus',(status)=>{ // This listens for a setStatus event (e.g. "online", "away", "busy", "offline") from a user, updates their current status, and broadcasts it to everyone else.
            socket.user.status=status; // Stores the status in the current socket object for future reference.
            socket.broadcast.emit('userStatusChanged',{ // Broadcasts to everyone except the sender that the user's status has changed.
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

                io.to(receiverId.toString()).emit('newPersonalMessage',message)
                if(callback){ // If the sender supplied a callback, they get confirmation + the message payload.
                    callback({
                        success:true,
                        data:message
                    })
                }
            } catch (error) {
                console.error('[Socket Event: sendPersonalMessage] Error:',error)
                if(callback){
                    callback({
                        success:false,
                        error:'Could not send personal message'
                    })
                }
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
                    return;
                }

                const validAttachments=attachments.map(att=>({
                    filename:att.filename,
                    url:att.url,
                    public_id:att.public_id,
                    mimetype:att.mimetype,
                    size:att.size,
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
                io.to(`project:${projectId}`).emit('newProjectMessage',message) // is broadcasting a real-time message to all users who have joined the Socket.IO room named project:<projectId>.
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
            }
        })

        socket.on('sendWorkspaceMessage',async(data,callback)=>{
            const userId=socket.user._id;
            try {
                const {workspaceId,content,attachments=[]}=data
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
                }
                const validAttachments=attachments.map(att=>({
                    filename:att.filename,
                    url:att.url,
                    public_id:att.public_id,
                    mimetype:att.mimetype,
                    size:att.size,
                }))

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
                io.to(`workspace:${workspaceId}`).emit('newWorkspaceMessage',message)
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
            }
        })

        socket.on('typing',(data)=>{
            const {receiverId,projectId,workspaceId,isTyping}=data;
            const typingData = { userId: socket.user._id, userName: socket.user.name.first, isTyping };

            if(workspaceId){
                socket.to(`workspace:${workspaceId}`).emit('userTyping', { ...typingData, workspaceId });
            }
            else if(projectId){
                socket.to(`project:${projectId}`).emit('userTyping', { ...typingData, projectId });
            }
            else if(receiverId){
                socket.to(receiverId.toString()).emit('userTyping', { ...typingData, receiverId });
            }
        })

        socket.on('disconnect',()=>{
            console.log(`[Socket Disconnect] User disconnected: ${socket.user.email}`);
            onlineUsers.delete(userId.toString())
            socket.broadcast.emit('userStatusChanged',{
                userId:userId,
                status:'offline'
            })
        })
    })
    return io;
}