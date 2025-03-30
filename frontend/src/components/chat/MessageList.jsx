import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

const MessageList = ({ messages, chatType, chatId }) => {
  const messagesEndRef = useRef(null);
  const currentUserId = useSelector(state => state.auth.user?._id);
  const typingUsers = useSelector(state => {
    if (!state.chat.typingUsers[chatType]) return {};
    return state.chat.typingUsers[chatType][chatId] || {};
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('Current user ID:', currentUserId);
    console.log('Messages:', messages);
  }, [currentUserId, messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages && messages.length > 0 ? (
        messages.map((message) => (
          <div key={message._id} className={`flex ${message.sender._id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3/4 p-3 rounded-lg ${
              message.sender._id === currentUserId 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-700 text-gray-100 rounded-tl-none'
            }`}>
              {message.sender._id !== currentUserId && (
                <div className="font-bold text-sm mb-1">{message.sender.name}</div>
              )}
              <div>{message.content}</div>
              {message.attachments?.length > 0 && message.attachments.map((attachment, index) => (
                <div key={index} className="mt-2">
                  <a 
                    href={attachment.url} 
                    className="text-blue-300 hover:text-blue-100 flex items-center"
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    📎 {attachment.filename}
                  </a>
                </div>
              ))}
              <div className="text-xs mt-1 opacity-80">
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-400">No messages yet</div>
      )}
      
      {/* Typing indicators */}
      {Object.keys(typingUsers).length > 0 && (
        <div className="text-sm text-gray-400 italic">
          {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;