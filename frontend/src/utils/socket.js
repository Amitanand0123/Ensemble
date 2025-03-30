import io from 'socket.io-client'

let socket=null

export const initSocket=(token)=>{
    if(socket && socket.connected) return socket;

    if(socket){
        socket.close();
        socket=null;
    }

    const SOCKET_URL=import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

    socket=io(SOCKET_URL, {
        auth:{token},
        reconnection:true,
        reconnectionAttempts:5,
        reconnectionDelay:1000,
        timeout:10000
    })

    socket.on('connect',(reason)=>{
        console.log('Socket connected',reason)
    })

    socket.on('disconnect',(reason)=>{
        console.log('Socket disconnected',reason)
    })

    socket.on('connect_error',(error)=>{
        console.error('Connection error:',error)
        setTimeout(()=>{
            socket.connect()
        },1000)
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

export const emitSocketEvent=(event,data)=>{
    if(!socket){
        throw new Error('Socket not initialized')
    }
    return new Promise((resolve,reject)=>{
        socket.emit(event,data,(response)=>{
            if(response?.error){
                reject(response.error)
            }
            else{
                resolve(response)
            }
        })
    })
}

export default{initSocket,disconnectSocket,getSocket,emitSocketEvent}