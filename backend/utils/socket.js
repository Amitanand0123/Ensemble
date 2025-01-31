import {Server} from 'socket.io'
import {verifySocketToken} from '../middlewares/socketAuth.js'
import Task from '../models/Task.js'
import Project from '../models/Project.js'
import Chat from '../models/Chat.js'
import {uploadToCloud} from '../utils/fileUpload.js'

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

        socket.broadcast.emit('userStatusChanged',{
            userId:userId,
            status:'online'
        })


        socket.on('taskUpdate',async (data)=>{
            try {
                const {taskId,update}=data;
                const task=await Task.findByid(taskId).populate('assignedTo','email');
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

        socket.on('sendPersonalMessage',async(data)=>{
            try {
                const {receiverId,content,attachments=[]}=data;
                const message=new Chat({
                    sender:userId,
                    receiver:receiverId,
                    content,
                    type:'personal',
                    attachments,
                    readBy:[{user:userId,readAt:new Date()}]
                })
                await message.save()
                await message.populate('sender','name avatar')
                socket.emit('messageSent',message);
                const receiverSocketId=onlineUsers.get(receiverId.toString())
                if(receiverSocketId){
                    io.to(receiverId.toString()).emit('newMessage',message)
                }
                socket.io(receiverId.toString()).emit('newPersonalMessage',message)
            } catch (error) {
                socket.emit('chatError',{message:'Could not send message'})
            }
        })

        socket.on('sendProjectMessage',async(data)=>{
            try {
                const {projectId,content,attachements=[]}=data
                const project=await Project.findById(projectId)
                if(!project || !project.isMember(userId)){
                    return socket.emit('chatError',{message:'Not authorized'})
                }

                const message=new Chat({
                    sender:userId,
                    project:projectId,
                    content,
                    type:'project',
                    attachments,
                    readBy:[{user:userId,readAt:new Date()}]
                })

                await message.save()
                await message.populate('sender','name avatar')
                // const memberIds=project.members
                //     .filter((m)=> m.status==='active')
                //     .map((m)=>m.user.toString())

                // memberIds.forEach((memberId)=>{
                //     socket.io(memberId).emit('newProjectMessage',message)
                // })
                // socket.emit('projectmessageSent',message);

                io.to(`project:${projetctId}`).emit('newProjectMessage',message)
            } catch (error) {
                socket.emit('chatError',{message:'Could not send message'})
            }
        })

        socket.on('uploadChatFile',async(data)=>{
            try {
                const {file,type,receiverId,projectId}=data;
                const uploadResult=await uploadToCloud(file)

                const attachment={
                    filename:file.originalname,
                    url:uploadResult.url,
                    type:file.mimetype
                }

                socket.emit('fileUploadSuccess',{
                    attachment,
                    receiverId:type==='personal'?receiverId:undefined,
                    projectId:type==='project'?projectId:undefined
                })
                // if(type=='personal'){
                //     socket.emit('fileUploadSucess',{attachment,receiverId})
                // }
                // else if(type==='project'){
                //     socket.emit('fileUploadSuccess',{attachment,projectId})
                // }

            } catch (error) {
                socket.emit('chatError',{message:'File upload failed'})
            }
        })

        socket.on('typing',(data)=>{
            const {receiverId,projectId,isTyping}=data
            if(projectId){
                socket.io(`project:${projectId}`).emit('userTyping',{
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
