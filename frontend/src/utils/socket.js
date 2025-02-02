import io from 'socket.io-client'

let socket=null

export const initSocket=(token)=>{
    if(socket) return socket;

    socket=io(process.env.REACT_APP_SOCKET_URL, {
        auth:{token},
        reconnection:true,
        reconnectionAttempts:5,
        reconnectionDelay:1000
    })

    socket.on('connect',()=>{
        console.log('Socket connected')
    })

    socket.on('disconnect',()=>{
        console.log('Socket disconnected')
    })

    socket.on('connect_error',(error)=>{
        console.error('Connections error:',error)
    })

    return socket;
}

export const disconnectSocket=()=>{
    if(socket){
        socket.disconnect()
        socket=null
    }
}

export const getSocket=()=>socket

export default{initSocket,disconnectSocket,getSocket}