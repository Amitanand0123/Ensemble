import React,{useState,useRef} from 'react'
import {useDispatch} from 'react-redux'
import FileUpload from './FileUpload.jsx'
import { useChatSocket } from '../../hooks/useChatSocket'

const MessageInput=({chatType,targetId,isConnected})=>{
    const dispatch=useDispatch()
    const [message,setMessage]=useState('')
    const [isUploading,setIsUploading]=useState(false)
    const {sendPersonalMessage,sendProjectMessage}=useChatSocket(localStorage.getItem('token'))

    const handleSubmit=async(e)=>{
        e.preventDefault()
        if(!message.trim() || !isConnected || isUploading) return 

        try {
            if(chatType==='personal'){
                await sendPersonalMessage(targetId,message)
            }
            else{
                await sendProjectMessage(targetId,message)
            }
            setMessage('')
        } catch (error) {
            console.error('Error sending message:',error)
        }
    }

    return (
        <form>
            <div>
                <FileUpload chatType={chatType} targetId={targetId} setIsUploading={setIsUploading} />
                <input 
                    type="text"
                    value={message}
                    onChange={(e)=>setMessage(e.target.value)}
                    placeholder='Type a message...'
                    className=''
                />
                <button type="submit" disabled={!isConnected || !message.trim() || isUploading} className=''>
                    Send
                </button>
            </div>
        </form>
    )
}

export default MessageInput;