
import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { Paperclip, MessageSquare } from 'lucide-react';
import { selectTypingUsers, selectCurrentChatInfo } from '../../redux/slices/chatSlice';
import PropTypes from 'prop-types';


const ChatMessage = ({ message, isOwnMessage, senderName }) => {
    return (
        <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fadeInUp`}>
            <div className={`flex flex-col max-w-[75%] md:max-w-[65%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Sender Name */}
                {!isOwnMessage && (
                    <div className="text-xs text-muted-foreground mb-1 ml-2 font-medium">{senderName}</div>
                )}

                {/* Message Bubble */}
                <div className={`py-2.5 px-4 rounded-lg shadow-lg ${
                        isOwnMessage
                            ? 'bg-sidebar text-sidebar-text rounded-tr-none border border-accent/30'
                            : 'bg-card text-foreground rounded-tl-none border border-border'
                    }`}
                >
                    {/* Message Content */}
                    {message.content && <div className="leading-relaxed">{message.content}</div>}

                    {/* --- Attachments --- */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className={`mt-2 space-y-1.5 ${message.content ? 'pt-2 border-t border-border/30' : ''}`}>
                            {message.attachments.map((attachment) => (
                                <a
                                    key={attachment.public_id || attachment.url}
                                    href={attachment.url}
                                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-accent/30 transition-colors ${
                                            isOwnMessage ? 'text-sidebar-text/90 hover:text-sidebar-text' : 'text-accent hover:text-accent/80'
                                        }`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={`Size: ${attachment.size ? (attachment.size / 1024).toFixed(1) + ' KB' : 'Unknown size'}`}
                                >
                                    <Paperclip className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-sm truncate font-medium">{attachment.filename}</span>
                                </a>
                            ))}
                        </div>
                    )}
                    {/* --- End Attachments --- */}


                    {/* Timestamp */}
                    <div className={`text-xs mt-1.5 ${isOwnMessage ? 'text-sidebar-textMuted' : 'text-muted-foreground'} text-right`}>
                        {format(new Date(message.createdAt), 'HH:mm')}
                    </div>
                </div>
            </div>
        </div>
    );
};


const MessageList = ({ messages, currentUserId }) => {
    const messagesEndRef = useRef(null);
    const currentChat = useSelector(selectCurrentChatInfo); 

    
    const typingUsersSelector = currentChat ? selectTypingUsers(currentChat.type, currentChat.id) : () => ({});
    const typingUsersMap = useSelector(typingUsersSelector);
    const typingUserNames = Object.values(typingUsersMap);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUserNames]); 

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            {messages && messages.length > 0 ? (
                messages.map((message) => {
                    if (!message || !message.sender) { 
                        console.warn("Message or message.sender is undefined", message);
                        return null; 
                    }
                    console.log("message sender id:", message.sender._id);
                    console.log("current user id:", currentUserId);
                    const isOwnMessage = message.sender?._id === currentUserId;
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
                <div className="text-center py-16">
                    <div className="max-w-sm mx-auto bg-accent/20 border-2 border-dashed border-border rounded-xl p-8">
                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                            <MessageSquare className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-2">No messages yet</h3>
                        <p className="text-sm text-muted-foreground">Start the conversation by sending a message</p>
                    </div>
                </div>
            )}

             {/* Typing indicators */}
            {typingUserNames.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground italic pt-2 pl-2 animate-pulse">
                    <div className="flex gap-1">
                        <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                        <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                        <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                    </div>
                    <span>{typingUserNames.join(', ')} {typingUserNames.length === 1 ? 'is' : 'are'} typing...</span>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
};

MessageList.propTypes = {
    messages: PropTypes.array.isRequired,
    currentUserId: PropTypes.string.isRequired,
};

ChatMessage.propTypes = {
    message: PropTypes.object.isRequired,
    isOwnMessage: PropTypes.bool.isRequired,
    senderName: PropTypes.string.isRequired,
};

export default MessageList;