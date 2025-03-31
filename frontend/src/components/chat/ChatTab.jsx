// frontend/src/components/chat/ChatTab.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import { Card } from '@/components/ui/card'; // Assuming path is correct
import {
  fetchPersonalMessages,
  fetchWorkspaceMessages,
  fetchProjectMessages,
  setCurrentChat,
} from '../../redux/slices/chatSlice.js'; // Adjust path
import { useChatSocket } from '../../hooks/useChatSocket.js'; // Adjust path
import { Loader2 } from 'lucide-react'; // Import a loading icon

const ChatTab = ({ type, id }) => {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const { isConnected } = useChatSocket(token); // Hook provides connection status

  // --- Selectors ---
  // Use specific selectors for clarity if available, otherwise keep inline logic
  const messages = useSelector(state => {
    const chatState=state.chat
    if (type === 'workspace' && chatState.workspaceMessages) {
      // return selectWorkspaceMessages(id)(state); // Use selector if defined
      return chatState.workspaceMessages[id] || [];
    } else if (type === 'project' && chatState.projectMessages) {
      // return selectProjectMessages(id)(state); // Use selector if defined
      return chatState.projectMessages[id] || [];
    } else if (type === 'personal' && chatState.personalMessages) {
      // return selectPersonalMessages(id)(state); // Use selector if defined
      return chatState.personalMessages[id] || [];
    }
    return [];
  });
  const isLoading = useSelector(state => state.chat.isLoading);
  const currentUserId = useSelector(state => state.auth.user?._id); // Get current user ID
  const currentChatInfo=useSelector(state=>state.chat.currentChat)

  // --- Fetch messages ---
  useEffect(() => {
    console.log(`[ChatTab ${type}:${id}] Mounting or ID/type changed. Fetching messages.`);
    if (id && type) { // Ensure id and type are present
        if (type === 'workspace') {
            dispatch(fetchWorkspaceMessages(id));
        } else if (type === 'project') {
            dispatch(fetchProjectMessages(id));
        } else if (type === 'personal') {
            dispatch(fetchPersonalMessages(id));
        }
        // Mark this chat as current
        dispatch(setCurrentChat({ type, id }));
    }

    // Cleanup: clear current chat when unmounting
    return () => {
        console.log(`[ChatTab ${type}:${id}] Unmounting. Clearing current chat.`);
        dispatch(setCurrentChat(null));
    };
  }, [dispatch, type, id]); // Dependency array includes things that trigger re-fetch

  // --- Render Logic ---
  const renderContent = () => {
    // **Improved Loading State:** Show loading indicator if loading AND messages haven't been loaded yet
    if (isLoading && messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            Loading messages...
        </div>
      );
    }

    // Pass currentUserId to MessageList for "You" logic
    return <MessageList messages={messages} currentUserId={currentUserId} />;
  };


  return (
    <Card className="h-[calc(100vh-250px)] flex flex-col bg-gray-900 border-gray-700"> {/* Adjusted height, background */}
      <ChatHeader chatType={type} targetId={id} />
      <div className="flex-1 overflow-y-auto p-4 bg-gray-850 custom-scrollbar"> {/* Add custom-scrollbar class if defined */}
        {renderContent()}
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-900">
        <MessageInput chatType={type} targetId={id} isConnected={isConnected} />
      </div>
    </Card>
  );
};

export default ChatTab;