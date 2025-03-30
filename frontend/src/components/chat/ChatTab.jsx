import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import { Card } from '@/components/ui/card';
import { 
  fetchPersonalMessages, 
  fetchWorkspaceMessages,
  fetchProjectMessages ,
  setCurrentChat
} from '../../redux/slices/chatSlice.js';
import { useChatSocket } from '../../hooks/useChatSocket.js';

const ChatTab = ({ type, id }) => {
  const dispatch = useDispatch();
  const token=localStorage.getItem('token')
  const {isConnected}=useChatSocket(token);
  const [localMessages,setLocalMessages]=useState([])
  const messages = useSelector(state => {
    if (type === 'workspace') {
      console.log("in workspace chat component hehe")
      return state.chat.workspaceMessages[id] || [];
    } else if (type === 'project') {
      return state.chat.projectMessages[id] || [];
    } else if (type === 'personal') {
      return state.chat.personalMessages[id] || [];
    }
    return [];
  });
  const isLoading = useSelector(state => state.chat.isLoading);
  const socketStatus=useSelector(state=>state.socket?.isConnected)
  useEffect(()=>{
    if(messages && messages.length>0){
      setLocalMessages(messages)
    }
  },[messages])
  useEffect(() => {
    // Fetch messages based on chat type
    if (type === 'workspace') {
      dispatch(fetchWorkspaceMessages(id));
    } else if (type === 'project') {
      dispatch(fetchProjectMessages(id));
    } else if (type === 'personal') {
      dispatch(fetchPersonalMessages(id));
    }
    return ()=>{
      dispatch(setCurrentChat(null))
    }
  }, [dispatch, type, id]);

  useEffect(()=>{
    console.log('Socket connection in ChatTab:',isConnected)
  },[isConnected])

  if (isLoading && localMessages.length==0) {
    return <div className="flex items-center justify-center h-64">Loading messages...</div>;
  }

  return (
    <Card className="h-[calc(100vh-300px)] flex flex-col">
      <ChatHeader chatType={type} targetId={id} />
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        <MessageList messages={messages} chatType={type} chatId={id} />
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <MessageInput chatType={type} targetId={id} isConnected={isConnected || socketStatus} />
      </div>
    </Card>
  );
};


export default ChatTab;