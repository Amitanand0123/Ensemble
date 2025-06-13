import {useEffect} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import MessageList from './MessageList.jsx'
import MessageInput from './MessageInput.jsx'
import ChatHeader from './ChatHeader.jsx'
import { fetchPersonalMessages, fetchProjectMessages } from '../../redux/slices/chatSlice'
import {useChatSocket} from '../../hooks/useChatSocket.js'
import PropTypes from 'prop-types';

const ChatWindow=({chatType,targetId})=>{
    const dispatch=useDispatch()
    const {isConnected}=useChatSocket(localStorage.getItem('token'))
    const messages=useSelector(state=> chatType==='personal' ? state.chat.personalMessages[targetId] || []:state.chat.projectMessages[targetId] || [])
    const currentUserId=useSelector(state=>state.auth.user?.id)
    console.log("CurrentUserId:",currentUserId)
    

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
            <MessageList messages={messages} currentUserId={currentUserId} />
            <MessageInput chatType={chatType} targetId={targetId} isConnected={isConnected} />
        </div>
    )
}


ChatWindow.propTypes={
    chatType:PropTypes.string.isRequired,
    targetId:PropTypes.string.isRequired
}

export default ChatWindow