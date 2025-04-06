// components/chat/MessageInput.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios'; // Import axios
import { useChatSocket } from '../../hooks/useChatSocket';
import { Button } from '@/components/ui/button'; // Assuming Shadcn UI
import { Input } from '@/components/ui/input'; // Assuming Shadcn UI
import { Paperclip, XCircle, Loader2 } from 'lucide-react'; // Icons
import { toast } from 'react-hot-toast'; // Notifications

const MessageInput = ({ chatType, targetId, isConnected }) => {
    const dispatch = useDispatch();
    const [message, setMessage] = useState('');
    const [pendingAttachments, setPendingAttachments] = useState([]); // Store metadata of uploaded files
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [sendStatus, setSendStatus] = useState(''); // 'sending', 'error', ''

    const token = useSelector(state => state.auth.token); // Get token for auth headers
    const { sendPersonalMessage, sendWorkspaceMessage, sendProjectMessage, setTyping } = useChatSocket(token);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for file input

    // Typing indicator logic (remains the same)
    const handleTyping = () => {
        // ... (typing logic) ...
        setTyping(chatType, targetId, true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(chatType, targetId, false);
        }, 2000);
    };
     useEffect(() => {
         return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setTyping(chatType, targetId, false); // Ensure typing stops on unmount/change
         };
     }, [chatType, targetId, setTyping]);

    // --- File Upload Handler ---
    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null); // Clear previous error
        setIsUploading(true);

        const formData = new FormData();
        formData.append('chatAttachment', file); // Match backend field name

        try {
            const response = await axios.post(
                'http://localhost:5000/api/chat/upload', // Use the new backend endpoint
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                // Add received metadata to pending attachments
                setPendingAttachments(prev => [...prev, response.data.attachment]);
                toast.success(`${file.name} ready to send.`);
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'File upload failed.';
            console.error('File upload error:', error);
            setUploadError(errorMsg);
            toast.error(`Upload failed: ${errorMsg}`);
        } finally {
            setIsUploading(false);
            // Reset file input so the same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = null;
            }
        }
    };

    // --- Remove Pending Attachment ---
    const removePendingAttachment = (indexToRemove) => {
        setPendingAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // --- Message Submit Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Check if message is empty AND no attachments are pending
        if (!message.trim() && pendingAttachments.length === 0) return;

        try {
            setSendStatus('sending');
            setTyping(chatType, targetId, false); // Stop typing indicator

            let sentMessageData;

            // --- Call appropriate socket function with attachments ---
            const attachmentsToSend = pendingAttachments; // Use the current pending attachments

            if (chatType === 'personal') {
                sentMessageData = await sendPersonalMessage(targetId, message, attachmentsToSend);
            } else if (chatType === 'workspace') {
                sentMessageData = await sendWorkspaceMessage(targetId, message, attachmentsToSend);
            } else if (chatType === 'project') {
                sentMessageData = await sendProjectMessage(targetId, message, attachmentsToSend);
            }

            setMessage(''); // Clear message input
            setPendingAttachments([]); // Clear pending attachments after successful send
            setSendStatus(''); // Reset send status

        } catch (error) {
            console.error('Error sending message:', error);
            setSendStatus('error');
             toast.error(`Failed to send message: ${error}`);
            // Keep message and attachments in input for retry
            setTimeout(() => setSendStatus(''), 3000); // Allow retry after 3 sec
        }
    };

    // Determine if send button should be disabled
    const isSendDisabled = (!message.trim() && pendingAttachments.length === 0) || isUploading || sendStatus === 'sending';

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-2">
            {/* --- Display Pending Attachments --- */}
            {pendingAttachments.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border border-gray-600 rounded-md bg-gray-700/50">
                    {pendingAttachments.map((att, index) => (
                        <div key={index} className="flex items-center gap-1 bg-gray-600 px-2 py-1 rounded text-sm">
                            <Paperclip className="w-3 h-3 text-gray-400" />
                            <span className="truncate max-w-[150px]">{att.filename}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePendingAttachment(index)}
                                className="p-0 h-auto text-red-400 hover:text-red-300 ml-1"
                                disabled={isUploading || sendStatus === 'sending'}
                            >
                                <XCircle className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

             {/* --- Input Row --- */}
            <div className="flex items-center space-x-2">
                {/* --- File Upload Button --- */}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()} // Trigger hidden file input
                    disabled={isUploading || sendStatus === 'sending'}
                    className="text-gray-400 hover:text-white"
                    aria-label="Attach file"
                >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                </Button>
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt" // Example accept types
                />

                {/* --- Message Text Input --- */}
                <Input
                    type="text"
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        handleTyping();
                    }}
                    placeholder="Type a message..."
                    className="flex-1 rounded-md bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500 p-2"
                    disabled={isUploading || sendStatus === 'sending'}
                />

                 {/* --- Send Button --- */}
                <Button
                    type="submit"
                    disabled={isSendDisabled}
                    className={`px-4 py-2 rounded-md ${isSendDisabled
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white transition-colors`}
                >
                    {sendStatus === 'sending' ? (<Loader2 className="w-4 h-4 animate-spin"/>)
                        : sendStatus === 'error' ? 'Retry'
                        : 'Send'}
                </Button>
            </div>

             {/* --- Upload Error Display --- */}
             {uploadError && (
                <div className="text-red-400 text-xs mt-1">
                    Upload Error: {uploadError}
                </div>
             )}

            {/* --- Connection Status (Optional) --- */}
            {/* {!isConnected && (
                <div className="text-yellow-400 text-xs mt-1">
                    Connecting... Messages may be delayed.
                </div>
            )} */}
        </form>
    );
};

export default MessageInput;