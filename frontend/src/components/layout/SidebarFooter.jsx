import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { User as UserIcon, Settings, LogOut, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PropTypes from 'prop-types';

const SidebarFooter = ({ onNavigate }) => {
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const { logout } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            setShowLogoutConfirm(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleNavigate = (path) => {
        navigate(path);
        if (onNavigate) onNavigate();
    };

    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
        const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
        return firstInitial + lastInitial;
    };

    const profileName = `${user?.name?.first || ''} ${user?.name?.last || ''}`.trim() || 'User';
    const initials = getInitials(user?.name?.first, user?.name?.last);

    return (
        <>
            <div className="p-3 border-t border-sidebar-hover">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-sidebar-hover transition-colors text-sidebar-text">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative">
                                    <Avatar className="h-8 w-8 ring-2 ring-sidebar">
                                        <AvatarImage src={user?.avatar?.url} alt={profileName} />
                                        <AvatarFallback className="bg-primary text-foreground text-xs font-semibold">
                                            {initials || <UserIcon className="h-4 w-4" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Online indicator */}
                                    <span className="online-indicator absolute -bottom-0.5 -right-0.5" />
                                </div>
                                <div className="text-left min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate text-sidebar-text">
                                        {profileName}
                                    </p>
                                    <p className="text-xs text-sidebar-textMuted truncate">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>
                            <ChevronUp className="w-4 h-4 text-sidebar-textMuted flex-shrink-0" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-popover border-border mb-2" align="end" side="top">
                        <DropdownMenuItem
                            onClick={() => handleNavigate(`/profile/${user?.id || 'me'}`)}
                            className="cursor-pointer hover:bg-accent"
                        >
                            <UserIcon className="w-4 h-4 mr-2" />
                            <span>My Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleNavigate('/settings')}
                            className="cursor-pointer hover:bg-accent"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            <span>Preferences</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem
                            onClick={() => setShowLogoutConfirm(true)}
                            className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            <span>Sign Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && createPortal(
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-card backdrop-blur-sm border-2 border-border p-6 rounded-xl shadow-2xl w-full max-w-sm">
                        <h2 className="text-xl font-semibold text-foreground mb-2">Sign Out?</h2>
                        <p className="text-muted-foreground mb-6">Are you sure you want to sign out?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 bg-muted hover:bg-accent text-foreground rounded-lg transition-colors font-medium border border-border hover:border-border"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

SidebarFooter.propTypes = {
    onNavigate: PropTypes.func
};

export default SidebarFooter;
