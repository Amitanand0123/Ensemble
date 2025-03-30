import React,{useEffect, useState} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import MessageList from './MessageList.jsx'
import MessageInput from './MessageInput.jsx'
import ChatHeader from './ChatHeader.jsx'
import { fetchPersonalMessages, fetchProjectMessages } from '../../redux/slices/chatSlice'
import {useChatSocket} from '../../hooks/useChatSocket.js'
import { useLocation } from 'react-router-dom'

const ChatWindow=({chatType,targetId})=>{
    const dispatch=useDispatch()
    const {isConnected}=useChatSocket(localStorage.getItem('token'))
    const currentChat=useSelector(state=>state.chat.currentChat)
    const messages=useSelector(state=> chatType==='personal' ? state.chat.personalMessages[targetId] || []:state.chat.projectMessages[targetId] || [])
    

    useEffect(()=>{
        if(chatType==='personal'){
            dispatch(fetchPersonalMessages(targetId))
        }
        else{
            dispatch(fetchProjectMessages(targetId))
        }
    },[dispatch,chatType,targetId])

    return (
        <div>
            <ChatHeader chatType={chatType} targetId={targetId} />
            <MessageList messages={messages} />
            <MessageInput chatType={chatType} targetId={targetId} isConnected={isConnected} />
        </div>
    )
}

export default ChatWindow