import { useSelector, useDispatch } from 'react-redux';
import { MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { setCurrentChat } from '../../redux/slices/chatSlice';
import PropTypes from 'prop-types';

const SidebarDirectMessages = ({ onNavigate }) => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const personalMessages = useSelector(state => state.chat.personalMessages);
    const currentChat = useSelector(state => state.chat.currentChat);
    const allUsers = useSelector(state => state.users.users);

    const chatUserIds = Object.keys(personalMessages || {});

    const directMessages = chatUserIds.map(userId => {
        const messages = personalMessages[userId] || [];
        const lastMessage = messages[messages.length - 1];
        const chatUser = allUsers?.find(u => u._id === userId);

        return {
            userId,
            name: chatUser ? `${chatUser.name?.first || ''} ${chatUser.name?.last || ''}`.trim() || chatUser.email : 'Unknown User',
            avatar: chatUser?.avatar?.url,
            isOnline: false,
            unreadCount: 0,
            lastMessage: lastMessage?.content || '',
            lastMessageTime: lastMessage?.createdAt
        };
    }).filter(dm => dm.userId !== user?._id);

    const handleChatClick = (chatUserId, chatUserName) => {
        dispatch(setCurrentChat({
            type: 'personal',
            id: chatUserId,
            name: chatUserName
        }));
        if (onNavigate) onNavigate();
    };

    return (
        <div className="space-y-2">
            <div className="px-3 py-1 flex items-center justify-between">
                <h3 className="text-xs font-semibold text-sidebar-textMuted uppercase tracking-wider">
                    Direct Messages
                </h3>
            </div>

            {directMessages.length > 0 ? (
                <div className="space-y-1">
                    {directMessages.map((dm) => {
                        const isActive = currentChat?.type === 'personal' && currentChat?.id === dm.userId;
                        return (
                            <button
                                key={dm.userId}
                                onClick={() => handleChatClick(dm.userId, dm.name)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                    transition-colors sidebar-item-transition
                                    ${isActive
                                        ? 'bg-sidebar-active text-sidebar-text'
                                        : 'text-sidebar-textMuted hover:bg-sidebar-hover hover:text-sidebar-text'
                                    }
                                `}
                            >
                                <div className="relative">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={dm.avatar} alt={dm.name} />
                                        <AvatarFallback className="text-xs bg-chart-1">
                                            {dm.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {dm.isOnline && (
                                        <span className="online-indicator absolute -bottom-0.5 -right-0.5" />
                                    )}
                                </div>
                                <span className="truncate flex-1 text-left text-sm">{dm.name}</span>
                                {dm.unreadCount > 0 && (
                                    <span className="unread-badge">
                                        {dm.unreadCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="px-3 py-4 text-center">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-sidebar-textMuted opacity-50" />
                    <p className="text-xs text-sidebar-textMuted">
                        No direct messages yet
                    </p>
                    <p className="text-xs text-sidebar-textMuted mt-1 opacity-75">
                        Start a conversation from user profiles
                    </p>
                </div>
            )}
        </div>
    );
};

SidebarDirectMessages.propTypes = {
    onNavigate: PropTypes.func
};

export default SidebarDirectMessages;
