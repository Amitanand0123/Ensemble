// --- START OF FILE frontend/src/components/layout/GlobalChatHandler.jsx ---

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom'; // Import useLocation
import ChatTab from '../chat/ChatTab';
import { setCurrentChat } from '../../redux/slices/chatSlice';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'; // Import Card for styling consistency
import { X } from 'lucide-react';

const GlobalChatHandler = () => {
    const dispatch = useDispatch();
    const location = useLocation(); // Get current location object
    const currentChat = useSelector(state => state.chat.currentChat);

    const handleCloseChat = () => {
        dispatch(setCurrentChat(null));
    };

    // --- Logic to prevent redundant display ---
    let isChatVisibleInMainContent = false;
    if (currentChat) {
        const { type, id } = currentChat;
        const path = location.pathname.toLowerCase(); // Get current path

        if (type === 'workspace' && path.startsWith(`/workspaces/${id}`)) {
            // Check if the current path is for this workspace AND potentially on the chat tab (optional refinement)
            // For simplicity, we assume if they are on the workspace detail page, they *might* click the chat tab.
             // More precise check: if (path === `/workspaces/${id}/chat`) // Requires defining such routes
             isChatVisibleInMainContent = true;
            //  console.log(`[GlobalChatHandler] Preventing render: Workspace chat ${id} likely visible in main content.`);
        } else if (type === 'project' && path.includes(`/projects/${id}`)) {
            // Check if the current path includes this project ID
            // More precise check: if (path.endsWith(`/projects/${id}/chat`)) // Requires defining such routes
            isChatVisibleInMainContent = true;
            // console.log(`[GlobalChatHandler] Preventing render: Project chat ${id} likely visible in main content.`);
        }
        // Personal chats are generally *only* shown via this global handler (unless you have a dedicated /chat page)
         // So, no check needed for type === 'personal' here unless you change that structure.
    }
    // ------------------------------------------


    // Render conditions:
    // 1. There must be a currentChat set.
    // 2. The currentChat context should NOT be the one likely visible in the main content area.
    if (!currentChat || isChatVisibleInMainContent) {
        return null; // Don't render the global chat overlay
    }

    // Render the floating chat window
    return (
         // Use Card for consistent styling with ChatTab, adjust padding/border as needed
        <Card className="fixed bottom-0 right-0 md:right-4 md:bottom-4 z-[100] w-full max-w-sm h-[60vh] md:h-[70vh] shadow-2xl rounded-t-lg md:rounded-lg overflow-hidden flex flex-col bg-gray-900 border border-gray-700 animate-fade-in-up">
            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800 flex-shrink-0"> {/* Use flex-shrink-0 */}
                <h3 className="text-white font-semibold text-sm truncate">
                    {currentChat.type === 'personal' ? `Chat with ${currentChat.name || 'User'}` : currentChat.name || 'Chat'}
                </h3>
                <Button variant="ghost" size="icon" onClick={handleCloseChat} className="text-gray-400 hover:text-white h-6 w-6">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close chat</span>
                </Button>
            </div>

            {/* Chat Content Area */}
            <div className="flex-grow overflow-hidden"> {/* Let ChatTab handle its own scrolling */}
                <ChatTab
                    type={currentChat.type}
                    id={currentChat.id}
                    // Key forces remount, which might re-trigger fetching, consider if needed
                    key={`${currentChat.type}-${currentChat.id}`}
                />
            </div>
        </Card>
    );
};

export default GlobalChatHandler;
// --- END OF FILE frontend/src/components/layout/GlobalChatHandler.jsx ---