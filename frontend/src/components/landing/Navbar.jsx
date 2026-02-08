import { useState, useEffect } from 'react';
import {  useDispatch } from 'react-redux';
import {  Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import { updateUser } from '../../redux/slices/authSlice';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    
    const { isAuthenticated, user, logout } = useAuth();
    const dispatch = useDispatch();
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState(user?.avatar?.url || '');

    useEffect(() => {   {/*  Ensures that: The latest avatar URL of the currently logged-in user is displayed. */}
        setCurrentAvatarUrl(user?.avatar?.url || '');
        const fetchFreshAvatar = async () => {
            if(isAuthenticated && user?.id){
                try {
                    const response = await axios.get('/api/users/me/avatar-url', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    if (response.data.success && response.data.avatarUrl) {
                        setCurrentAvatarUrl(response.data.avatarUrl);
                        if (user.avatar?.url !== response.data.avatarUrl) {
                            dispatch(updateUser({ avatar: { url: response.data.avatarUrl } }));  
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch fresh avatar URL:", error);
                }
            }
        };
        fetchFreshAvatar();
    }, [isAuthenticated, user?.id, user?.avatar?.url, dispatch]);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            setScrolled(offset > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const confirmLogout = async () => {
        try {
            await logout();
            setShowLogoutPopup(false);
        } catch (error) {
            console.error("Logout failed in Navbar:", error);
            setShowLogoutPopup(false);
        }
    };

    const handleLogoutClick = (e) => {
        e.preventDefault();
        setShowLogoutPopup(true);
    };

    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
        const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
        return firstInitial + lastInitial;
    };

    const profileName = `${user?.name?.first || ''} ${user?.name?.last || ''}`.trim();
    const avatarDisplayUrl = currentAvatarUrl || user?.avatar?.url;
    const initials = getInitials(user?.name?.first, user?.name?.last);

    return (
        <>
            <nav
                className={`w-full fixed top-0 left-0 right-0 border-b border-border backdrop-blur-xl z-50 transition-all duration-300 ease-in-out ${scrolled ? 'bg-card/98 ensemble-card-shadow' : 'bg-card/90'}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center">
                                <img
                                    src="/ensemble-logo-1.svg"
                                    alt="Ensemble Logo"
                                    className="h-8 w-auto md:h-9"
                                />
                            </div>
                            <a
                                href="/"
                                className="text-xl md:text-2xl font-bold text-primary hover:text-primary/80 transition-all duration-300"
                            >
                                Ensemble
                            </a>
                        </div>

                        <button
                            className="md:hidden p-2 rounded-md bg-secondary/60 text-foreground hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                            aria-label="Toggle Menu"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
                                />
                            </svg>
                        </button>

                        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                            <a
                                href="/explore"
                                className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors font-medium"
                            >
                                Explore
                            </a>
                            <a
                                href="/pricing"
                                className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors font-medium"
                            >
                                Pricing
                            </a>
                            <a
                                href="/about"
                                className="text-sm lg:text-base text-muted-foreground hover:text-foreground transition-colors font-medium"
                            >
                                About
                            </a>
                            {isAuthenticated && user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center focus:outline-none focus:ring-2 focus:ring-ring rounded-full ml-4">
                                            <Avatar className="h-9 w-9 ring-2 ring-border hover:ring-primary transition-all duration-200">
                                                <AvatarImage
                                                    src={avatarDisplayUrl}
                                                    alt={profileName}
                                                    key={avatarDisplayUrl}
                                                />
                                                <AvatarFallback className="bg-gradient-to-br from-chart-1 via-chart-3 to-chart-5 text-foreground font-semibold">
                                                    {initials || <UserIcon className="h-5 w-5" />}
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 bg-popover border-border text-popover-foreground" align="end">
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{profileName}</p>
                                                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-border" />
                                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent focus:bg-accent">
                                            <Link to={`/profile/${user.id || 'me'}`}><UserIcon className="mr-2 h-4 w-4" /><span>My Profile</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent focus:bg-accent">
                                            <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /><span>Dashboard</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-border" />
                                        <DropdownMenuItem onClick={handleLogoutClick} className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive">
                                            <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <a
                                    href="/login"
                                    className="ml-4 px-5 py-2 text-sm lg:text-base font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Log in
                                </a>
                            )}
                        </div>
                    </div>

                    <div
                        className={`
                            md:hidden
                            absolute top-full left-0
                            w-full mt-1
                            bg-popover/98 backdrop-blur-lg
                            border-b border-x border-border
                            shadow-xl
                            transform origin-top transition-all duration-200 ease-in-out
                            ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}
                        `}
                    >
                        <div className="px-4 py-4 space-y-2">
                            <a
                                href="/explore"
                                className="block text-base text-muted-foreground hover:text-foreground hover:bg-accent transition-all py-2.5 px-3 rounded-md font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Explore
                            </a>
                            <a
                                href="/pricing"
                                className="block text-base text-muted-foreground hover:text-foreground hover:bg-accent transition-all py-2.5 px-3 rounded-md font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Pricing
                            </a>
                            <a
                                href="/about"
                                className="block text-base text-muted-foreground hover:text-foreground hover:bg-accent transition-all py-2.5 px-3 rounded-md font-medium"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About
                            </a>
                             {isAuthenticated && user && (
                                 <Link
                                     to={`/profile/${user.id || 'me'}`}
                                     className="block text-base text-muted-foreground hover:text-foreground hover:bg-accent transition-all py-2.5 px-3 rounded-md font-medium"
                                     onClick={() => setIsMenuOpen(false)}
                                 >
                                     My Profile
                                 </Link>
                             )}
                            <div className="pt-2">
                                {isAuthenticated ? (
                                    <button
                                        onClick={(e) => { handleLogoutClick(e); setIsMenuOpen(false); }}
                                        className="block w-full text-base text-center px-4 py-2.5 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors font-medium"
                                    >
                                        Logout
                                    </button>
                                ) : (
                                    <a
                                        href="/login"
                                        className="block text-base text-center px-4 py-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Log in
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {showLogoutPopup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border p-6 rounded-xl shadow-2xl w-full max-w-sm text-center">
                        <h2 className="text-xl font-semibold text-foreground">Confirm Logout</h2>
                        <p className="mt-3 text-muted-foreground">Are you sure you want to log out?</p>
                        <div className="flex justify-center gap-3 mt-6">
                            <button
                                onClick={confirmLogout}
                                className="px-5 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg transition-colors font-medium"
                            >
                                Yes, Logout
                            </button>
                            <button
                                onClick={() => setShowLogoutPopup(false)}
                                className="px-5 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;