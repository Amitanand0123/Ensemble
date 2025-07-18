import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios'; 
import { useChatSocket } from '../../hooks/useChatSocket';
import { Button } from '@/components/ui/button'; 
import { Input } from '@/components/ui/input'; 
import { Paperclip, XCircle, Loader2, Send } from 'lucide-react'; 
import { toast } from 'react-hot-toast'; 
import PropTypes from 'prop-types';

const MessageInput = ({ chatType, targetId, isConnected }) => {
    const [message, setMessage] = useState('');
    const [pendingAttachments, setPendingAttachments] = useState([]); 
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [sendStatus, setSendStatus] = useState(''); 

    const token = useSelector(state => state.auth.token); 
    
    const { sendPersonalMessage, sendWorkspaceMessage, sendProjectMessage, setTyping } = useChatSocket(token);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null); 

    
    const handleTyping = () => {
        if (!targetId) return; 
        setTyping(chatType, targetId, true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(chatType, targetId, false);
        }, 2000);
    };
     useEffect(() => {
         return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
             
             if (targetId) {
                 setTyping(chatType, targetId, false);
             }
         };
     }, [chatType, targetId, setTyping]); 

    
    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setIsUploading(true);
        const uploadToast = toast.loading(`Uploading ${file.name}...`);

        const formData = new FormData();
        formData.append('chatAttachment', file);

        try {
            
            const response = await axios.post(
                '/api/chat/upload', 
                formData,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            if (response.data.success && response.data.attachment) {
                setPendingAttachments(prev => [...prev, response.data.attachment]);
                toast.success(`${file.name} ready to send.`, { id: uploadToast });
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'File upload failed.';
            console.error('File upload error:', error);
            setUploadError(errorMsg);
            toast.error(`Upload failed: ${errorMsg}`, { id: uploadToast });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        }
    };

    
    const removePendingAttachment = (indexToRemove) => {
        setPendingAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if ((!message.trim() && pendingAttachments.length === 0) || !targetId || !chatType) return;
        
        if (isUploading || sendStatus === 'sending') return;

        try {
            setSendStatus('sending');
            setTyping(chatType, targetId, false); 

            
            const attachmentsToSend = pendingAttachments; 

            if (chatType === 'personal') {
                await sendPersonalMessage(targetId, message, attachmentsToSend);
            } else if (chatType === 'workspace') {
                await sendWorkspaceMessage(targetId, message, attachmentsToSend);
            } else if (chatType === 'project') {
                await sendProjectMessage(targetId, message, attachmentsToSend);
            }

            
            setMessage('');
            setPendingAttachments([]);
            setSendStatus(''); 

        } catch (error) {
            console.error('Error sending message via hook:', error);
            setSendStatus('error');
             toast.error(`Failed to send message: ${error}`);
            
            
            setTimeout(() => setSendStatus(''), 3000);
        }
    };

    
    const isSendDisabled = (!message.trim() && pendingAttachments.length === 0) || isUploading || sendStatus === 'sending' || !isConnected;

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-2 p-2"> {/* Added padding */}
            {/* Display Pending Attachments */}
            {pendingAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border border-gray-600 rounded-md bg-gray-700/50 max-h-24 overflow-y-auto"> {/* Limit height */}
                    {pendingAttachments.map((att, index) => (
                        <div key={index} className="flex items-center gap-1 bg-gray-600 px-2 py-1 rounded text-sm">
                            <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate max-w-[150px]">{att.filename}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePendingAttachment(index)}
                                className="p-0 h-auto text-red-400 hover:text-red-300 ml-1 flex-shrink-0" 
                                disabled={isUploading || sendStatus === 'sending'}
                            >
                                <XCircle className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

             {/* Input Row */}
            <div className="flex items-center space-x-2">
                {/* File Upload Button */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || sendStatus === 'sending' || !isConnected} 
                    className="text-gray-400 hover:text-white disabled:text-gray-600" 
                    aria-label="Attach file"
                    title="Attach file"
                >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                     
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,audio/*,video/*"
                />

                {/* Message Text Input */}
                <Input
                    type="text"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping(); 
                    }}
                    placeholder={isConnected ? "Type a message..." : "Connecting..."}
                    className="flex-1 rounded-md bg-gray-700 text-white border-gray-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 p-2" 
                    disabled={isUploading || sendStatus === 'sending' || !isConnected} 
                    autoComplete="off"
                />

                 {/* Send Button */}
                <Button
                    type="submit"
                    size="icon" 
                    disabled={isSendDisabled}
                    className={`p-2 rounded-md ${isSendDisabled
                            ? 'bg-gray-500 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } transition-colors`}
                    aria-label="Send message"
                     title="Send message"
                >
                    {sendStatus === 'sending' ? (<Loader2 className="w-4 h-4 animate-spin"/>)
                        : sendStatus === 'error' ? (<XCircle className="w-4 h-4 text-red-400"/>) 
                        : (<Send className="w-4 h-4"/>)} {/* Use Send icon */}
                </Button>
            </div>

             {/* Upload Error Display */}
             {uploadError && (
                <div className="text-red-400 text-xs mt-1 px-1">
                    Upload Error: {uploadError}
                </div>
             )}
             {!isConnected && (
                <div className="text-yellow-500 text-xs mt-1 px-1">
                    Disconnected. Trying to reconnect...
                </div>
             )}
        </form>
    );
};

MessageInput.propTypes = {
    chatType: PropTypes.string.isRequired,
    targetId: PropTypes.string.isRequired,
    isConnected: PropTypes.bool.isRequired,
};

export default MessageInput;
