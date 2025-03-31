// frontend/src/components/chat/MessageList.jsx
import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns'; // Import date-fns formatting function

// Helper component for individual messages
const ChatMessage = ({ message, isOwnMessage, senderName }) => {
    return (
        <div className={`flex mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                 {/* Sender Name (only if not own message) */}
                 {!isOwnMessage && (
                    <div className="text-xs text-gray-400 mb-1 ml-2">{senderName}</div>
                 )}

                {/* Message Bubble */}
                <div className={`py-2 px-3 rounded-lg ${
                        isOwnMessage
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-gray-700 text-gray-100 rounded-tl-none'
                    }`}
                >
                    {/* Message Content */}
                    <div>{message.content}</div>

                    {/* Attachments (if any) */}
                    {message.attachments?.length > 0 && message.attachments.map((attachment, index) => (
                        <div key={index} className="mt-2">
                            <a
                                href={attachment.url}
                                className={`flex items-center ${isOwnMessage ? 'text-blue-200 hover:text-blue-100' : 'text-blue-300 hover:text-blue-200'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {/* Use appropriate icon based on attachment type if desired */}
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                {attachment.filename}
                            </a>
                        </div>
                    ))}

                    {/* Timestamp */}
                    <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                        {format(new Date(message.createdAt), 'HH:mm')} {/* Format time as HH:MM */}
                    </div>
                </div>
            </div>
        </div>
    );
};


const MessageList = ({ messages, currentUserId }) => { // Receive currentUserId as prop
  const messagesEndRef = useRef(null);

  // Get current chat details from Redux state
  const currentChat = useSelector(state => state.chat.currentChat); // <-- Get current chat info
    const typingUsers = useSelector(state => {
      if (!currentChat || !currentChat.type || !currentChat.id) {
          // No active chat selected, return empty object
          return {};
      }
      const { type, id } = currentChat; // Destructure type and id

      // Safely access the typing users for the current chat
      return state.chat.typingUsers?.[type]?.[id] || {}; // Use type and id dynamically
  });


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]); // Scroll when messages change


    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-1"> {/* Reduced space-y for tighter messages */}
            {messages && messages.length > 0 ? (
                messages.map((message) => {
                    // Determine if the message is from the current user
                    const isOwnMessage = message.sender?._id === currentUserId;
                    // Determine sender name (handles potential missing sender data)
                    const senderName = isOwnMessage ? "You" : message.sender?.name || 'Unknown User';

                    // Render the ChatMessage component
                    return (
                        <ChatMessage
                            key={message._id}
                            message={message}
                            isOwnMessage={isOwnMessage}
                            senderName={senderName}
                        />
                    );
                })
            ) : (
                // Display "No messages" only if NOT loading (handled in ChatTab)
                <div className="text-center text-gray-500 pt-10">No messages yet</div>
            )}

            {/* Typing indicators (remains the same) */}
            {Object.keys(typingUsers).length > 0 && (
                <div className="text-sm text-gray-400 italic pt-2 pl-2">
                    {Object.values(typingUsers).join(', ')} {Object.keys(typingUsers).length === 1 ? 'is' : 'are'} typing...
                </div>
            )}

            {/* Scroll target */}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;