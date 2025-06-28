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
                            // Only dispatches an update to the Redux store if the avatar URL has changed, preventing unnecessary global state updates.
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

    useEffect(() => { // This is typically used to change the navbar’s appearance when the user scrolls (e.g., background blur, shadows, etc.).
        const handleScroll = () => {
            const offset = window.scrollY;
            setScrolled(offset > 50);
        };
        window.addEventListener('scroll', handleScroll); // Attaches the handleScroll function to the browser's scroll event.
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
        e.preventDefault(); // stops the default link/button behavior
        setShowLogoutPopup(true);
    };

    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
        const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
        return firstInitial + lastInitial || '?';
    };

    const profileName = `${user?.name?.first || ''} ${user?.name?.last || ''}`.trim();
    const avatarDisplayUrl = currentAvatarUrl || user?.avatar?.url;

    return (
        <>
            <nav
                className={`w-full md:w-[80%] lg:w-[60%] fixed top-[3%] left-[50%] transform -translate-x-[50%] border border-slate-50 rounded-full shadow-lg backdrop-blur-md z-50 transition-all duration-300 ease-in-out ${scrolled ? 'bg-black/50' : 'bg-transparent'}`}
            >
                <div className="px-4 md:px-6 py-2 md:py-3">
                    <div className="flex items-center justify-between h-14 md:h-16">
                        <div className="flex items-center space-x-2 md:space-x-3">
                            <div className="flex items-center">
                                <img
                                    src="/ensemble-logo-1.svg"
                                    alt="Ensemble Logo"
                                    className="h-8 w-auto md:h-10 lg:h-12"
                                />
                            </div>
                            <a
                                href="/"
                                className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text animate-gradient transition-colors"
                            >
                                Ensemble
                            </a>
                        </div>

                        <button
                            className="md:hidden p-2 rounded-lg bg-gray-800/80 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
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

                        <div className="hidden md:flex items-center space-x-6 lg:space-x-8 gap-4">
                            <a
                                href="/explore"
                                className="text-base lg:text-lg text-gray-300 hover:text-white transition-colors"
                            >
                                Explore
                            </a>
                            <a
                                href="/pricing"
                                className="text-base lg:text-lg text-gray-300 hover:text-white transition-colors"
                            >
                                Pricing
                            </a>
                            <a
                                href="/about"
                                className="text-base lg:text-lg text-gray-300 hover:text-white transition-colors"
                            >
                                About
                            </a>
                            {isAuthenticated && user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500 rounded-full">
                                            <Avatar className="h-9 w-9 md:h-10 md:w-10">
                                                <AvatarImage 
                                                    src={avatarDisplayUrl} 
                                                    alt={profileName} 
                                                    key={avatarDisplayUrl}
                                                />
                                                <AvatarFallback className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold">
                                                    {getInitials(user.name?.first, user.name?.last)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-white" align="end">
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col space-y-1">
                                                <p className="text-sm font-medium leading-none">{profileName}</p>
                                                <p className="text-xs leading-none text-gray-400">{user.email}</p>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-gray-700" />
                                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                                            <Link to={`/profile/${user.id || 'me'}`}><UserIcon className="mr-2 h-4 w-4" /><span>My Profile</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-700 focus:bg-gray-700">
                                            <Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /><span>Dashboard</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-gray-700" />
                                        <DropdownMenuItem onClick={handleLogoutClick} className="cursor-pointer text-red-400 hover:bg-red-900/50 hover:text-red-300 focus:bg-red-900/50 focus:text-red-300">
                                            <LogOut className="mr-2 h-4 w-4" /><span>Log out</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <a
                                    href="/login"
                                    className="px-4 py-2 text-base lg:text-lg rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
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
                            w-full mt-2
                            bg-gray-900/95 backdrop-blur-md
                            rounded-2xl border border-gray-700
                            shadow-lg
                            transform origin-top transition-all duration-200 ease-in-out
                            ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}
                        `}
                    >
                        <div className="px-4 py-3 space-y-3">
                            <a
                                href="/explore"
                                className="block text-lg text-gray-300 hover:text-white transition-colors py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Explore
                            </a>
                            <a
                                href="/pricing"
                                className="block text-lg text-gray-300 hover:text-white transition-colors py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Pricing
                            </a>
                            <a
                                href="/about"
                                className="block text-lg text-gray-300 hover:text-white transition-colors py-2"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                About
                            </a>
                             {isAuthenticated && user && (
                                 <Link
                                     to={`/profile/${user.id || 'me'}`}
                                     className="block text-lg text-gray-300 hover:text-white transition-colors py-2"
                                     onClick={() => setIsMenuOpen(false)}
                                 >
                                     My Profile
                                 </Link>
                             )}
                            {isAuthenticated ? (
                                <button
                                    onClick={(e) => { handleLogoutClick(e); setIsMenuOpen(false); }}
                                    className="block w-full text-lg text-center px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-500 transition-colors"
                                >
                                    Logout
                                </button>
                            ) : (
                                <a
                                    href="/login"
                                    className="block text-lg text-center px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Log in
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {showLogoutPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm text-center">
                        <h2 className="text-xl font-semibold">Confirm Logout</h2>
                        <p className="mt-2 text-gray-300">Are you sure you want to log out?</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <button
                                onClick={confirmLogout}
                                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
                            >
                                Yes, Logout
                            </button>
                            <button
                                onClick={() => setShowLogoutPopup(false)}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded-md"
                            >
                                No, Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;