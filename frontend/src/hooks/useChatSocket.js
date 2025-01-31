import {useState,useEffect} from 'react'
import {useDispatch} from 'react-redux'
import io from 'socket.io-client'
import { addPersonalMessage, addProjectMessage } from '../redux/slices/chatSlice'
import { addNotification } from '../redux/slices/notificationSlice'

export const useChatSocket=(token)=>{
    const [socket,setSocket]=useState(null)
    const [isConnected,setIsConnected]=useState(false)
    const [error,setError]=useState(null)
    const dispatch=useDispatch()

    useEffect(()=>{
        const newSocket=io(process.env.REACT_APP_SOCKET_URL,{
            auth:{token},
            reconnection:true,
            reconnectionAttempts:5,
            reconnectionDelay:1000
        })
        newSocket.on('connect',()=>{
            console.log('Socket disconnected')
            setIsConnected(true)
            setError(null)
        })

        newSocket.on('disconnect',()=>{
            console.log('Socket disconnected')
            setIsConnected(false)
        })

        newSocket.on('connect_error',(error)=>{
            console.error('Connections error:',error)
            setError(error.message)
        })

        newSocket.on('newPersonalMessage',(message)=>{
            dispatch(addPersonalMessage({
                senderId:message.sender._id,
                message
            }))
        })

        newSocket.on('newProjectMessage',(message)=>{
            dispatch(addProjectMessage({
                projectId:message.project,
                message
            }))
        })

        newSocket.on('notification',(notification)=>{
            dispatch(addNotification(notification))
        })

        newSocket.on('chatError',(error)=>{
            console.error('Chat error:',error)
            setError(error.message)
        })

        setSocket(newSocket)

        return ()=>{
            newSocket.close()
        }

    },[token,dispatch])

    const sendPersonalMessage=async(receiverId,content,attachments=[])=>{
        if(!isConnected){
            throw new Error('Socket not connected')
        }
        return new Promise((resolve,reject)=>{
            socket.emit('sendPersonalMessage',{receiverId,content,attachments},(response)=>{
                if(response.error){
                    if(response.error){
                        reject(new Error(response.error))
                    }
                    else{
                        resolve(response)
                    }
                }
            })
        })
    }
    
    const sendProjectMessage=async(projectId,content,attachments=[])=>{
        if(!isConnected){
            throw new Error('Socket not connected')
        }
        return new Promise((resolve,reject)=>{
            socket.emit('sendProjectMessage',{projectId,content,attachments},(response)=>{
                if(response.error){
                    reject(new Error(response.error))
                }
                else{
                    resolve(response)
                }
            })
        })
    }
    
    const uploadChatFile=async(file,type,receiverId,projectId)=>{
        if(!isConnected){
            throw new Error('Socket not connected')
        }
        return new Promise((resolve,reject)=>{
            socket.emit('uploadChatFile',{file,type,receiverId,projectId},(response)=>{
                if(response.error){
                    reject(new Error(response.error))
                }
                else{
                    resolve(response)
                }
            })
        })
    }
    
    return {socket,isConnected,error,sendPersonalMessage,sendProjectMessage,uploadChatFile}
}

