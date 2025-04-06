// components/chat/MessageList.jsx
import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Paperclip } from 'lucide-react'; // Import icon

// Helper component for individual messages
const ChatMessage = ({ message, isOwnMessage, senderName }) => {
    return (
        <div className={`flex mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Sender Name */}
                {!isOwnMessage && (
                    <div className="text-xs text-gray-400 mb-1 ml-2">{senderName}</div>
                )}

                {/* Message Bubble */}
                <div className={`py-2 px-3 rounded-lg shadow-md ${ // Added shadow
                        isOwnMessage
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-gray-700 text-gray-100 rounded-tl-none'
                    }`}
                >
                    {/* Message Content */}
                    {message.content && <div>{message.content}</div>}

                    {/* --- Attachments --- */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className={`mt-2 space-y-1 ${message.content ? 'pt-2 border-t border-white/20' : ''}`}> {/* Add border if content exists */}
                            {message.attachments.map((attachment) => (
                                <a
                                    key={attachment.public_id || attachment.url} // Use public_id if available
                                    href={attachment.url}
                                    className={`flex items-center p-1.5 rounded hover:bg-black/20 transition-colors ${ // Style link
                                            isOwnMessage ? 'text-blue-100 hover:text-white' : 'text-blue-300 hover:text-blue-100'
                                        }`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`Size: ${(attachment.size / 1024).toFixed(1)} KB`} // Show size on hover
                                >
                                    <Paperclip className="h-4 w-4 mr-1.5 flex-shrink-0" /> {/* Adjust icon style */}
                                    <span className="text-sm truncate">{attachment.filename}</span> {/* Truncate long names */}
                                </a>
                            ))}
                        </div>
                    )}
                    {/* --- End Attachments --- */}


                    {/* Timestamp */}
                    <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                        {format(new Date(message.createdAt), 'HH:mm')}
                    </div>
                </div>
            </div>
        </div>
    );
};


const MessageList = ({ messages, currentUserId }) => {
    const messagesEndRef = useRef(null);
    const currentChat = useSelector(state => state.chat.currentChat);

    // Dynamically get typing users based on currentChat
     const typingUsersMap = useSelector(state => {
        if (!currentChat) return {};
        const { type, id } = currentChat;
        return state.chat.typingUsers?.[type]?.[id] || {};
    });
    const typingUserNames = Object.values(typingUsersMap);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar"> {/* Added custom-scrollbar */}
            {messages && messages.length > 0 ? (
                messages.map((message) => {
                    const isOwnMessage = message.sender?._id === currentUserId;
                     // If sender is somehow missing, still render but show 'Unknown'
                    const senderName = isOwnMessage ? "You" : message.sender?.name?.first || message.sender?.name || 'Unknown User';

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
                <div className="text-center text-gray-500 pt-10">No messages yet</div>
            )}

             {/* Typing indicators */}
            {typingUserNames.length > 0 && (
                <div className="text-sm text-gray-400 italic pt-2 pl-2 animate-pulse"> {/* Added pulse animation */}
                    {typingUserNames.join(', ')} {typingUserNames.length === 1 ? 'is' : 'are'} typing...
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;