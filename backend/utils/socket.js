import {Server} from 'socket.io'
import {verifySocketToken} from '../middlewares/socketAuth.js'
import Task from '../models/Task.js'

const setupSocketIO=(server)=>{
    const io=new Server(server,{
        cors:{
            origin:process.env.FRONTEND_URL,
            methods:["GET","POST"]
        }
    })
    io.use(verifySocketToken)
    io.on('connection',(socket)=>{
        const userId=socket.user._id
        socket.join(userId.toString())

        socket.on('taskUpdate',async (data)=>{
            const {taskId,update}=data;
            const task=await Task.findByid(taskId).populate('assignedTo','email');
            
            if(task.assignedTo){
                socket.io(task.assignedTo._id.toString()).emit('taskUpdated',{
                    message:`Task "${task.title}" has been updated`,
                    update,
                })
            }
        })

        socket.on('setStatus',(status)=>{
            socket.user.status=status;
            socket.broadcast.emit('userStatusChanged',{
                userId:userId,
                status:status
            })
        })

        socket.on('disconnect',()=>{
            socket.bradcast.emit('userStatusChanged',{
                userId:userId,
                status:'offline'
            })
        })
    })
    return io;
}

export default setupSocketIO;