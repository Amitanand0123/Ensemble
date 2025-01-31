import React,{useRef,useEffect} from 'react'
import { useSelector } from 'react-redux'

const MessageList=({messages})=>{
    const messagesEndRef=useRef(null)
    const currentUserId=useSelector(state=>state.auth.user?._id)
    const typingUsers=useSelector(state=>state.chat.typingUsers)

    const scrollToBottom=()=>{
        messagesEndRef.current?.scrollToView({behavior:'smooth'})
    }

    useEffect(()=>{
        scrollToBottom()
    },[messages])

    return (
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
            {messages.map((message)=>(
                <div key={message._id} className={`flex ${message.sender._id===currentUserId?'justify-end':'justify-start'}`}>
                    <div className=''>
                        {message.sender._id!==currentUserId && (
                            <div>{message.sender.name}</div>
                        )}
                        <div>{message.content}</div>
                        {message.attachments?.map((attachment,index)=>(
                            <div key={index} className='mt-2'>
                                <a href={attachment.url}>{attachment.filename}</a>
                            </div>
                        ))}
                        <div>
                            {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            ))}
            {typingUsers.size>0 &&(
                <div>
                    {Array.from(typingUsers).join(',')} is typing...
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    )
}

export default MessageList