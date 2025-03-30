import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FileUpload from './FileUpload';
import { useChatSocket } from '../../hooks/useChatSocket';

const MessageInput = ({ chatType, targetId, isConnected }) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [sendStatus, setSendStatus] = useState('');
  const { sendPersonalMessage, sendWorkspaceMessage, sendProjectMessage, setTyping } = useChatSocket(localStorage.getItem('token'));
  const typingTimeoutRef = useRef(null);
  const socketConnected = useSelector(state => state.socket?.isConnected) || isConnected;

  // Debug connection status
  useEffect(() => {
    console.log('Socket connection status:', socketConnected);
  }, [socketConnected]); 

  const handleTyping = () => {
    setTyping(chatType, targetId, true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(chatType, targetId, false);
    }, 2000);
  };

  useEffect(() => {
    // Cleanup typing timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setTyping(chatType, targetId, false);
    };
  }, [chatType, targetId, setTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setSendStatus('sending');
      // Clear typing indicator
      setTyping(chatType, targetId, false);
      
      if (chatType === 'personal') {
        await sendPersonalMessage(targetId, message);
      } else if (chatType === 'workspace') {
        await sendWorkspaceMessage(targetId, message);
      } else if (chatType === 'project') {
        await sendProjectMessage(targetId, message);
      }
      setMessage('');
      setSendStatus('');
    } catch (error) {
      console.error('Error sending message:', error);
      setSendStatus('error');
      setTimeout(() => setSendStatus(''), 3000);
    }
  };

  // If socket is not connected, try to use a fallback method
  const isButtonDisabled = (!socketConnected && sendStatus !== 'sending') || isUploading;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center space-x-2">
        {/* <FileUpload 
          chatType={chatType} 
          targetId={targetId} 
          setIsUploading={setIsUploading} 
        /> */}
        <input 
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-md bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500 p-2"
        />
        <button 
          type="submit" 
          disabled={!message.trim() || isUploading || sendStatus === 'sending'} 
          className={`px-4 py-2 rounded-md ${
            !message.trim() || isUploading || sendStatus === 'sending'
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {sendStatus === 'sending' ? 'Sending...' : sendStatus === 'error' ? 'Retry' : 'Send'}
        </button>
      </div>
      {socketConnected === false && (
        <div className="text-yellow-400 text-xs mt-1">
          Socket disconnected. Messages may not send immediately.
        </div>
      )}
    </form>
  );
};

export default MessageInput;