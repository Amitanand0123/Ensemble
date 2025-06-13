// frontend/src/components/user/UserProfile.jsx

import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserById, updateUserAvatar, clearSelectedUser } from '../../redux/slices/usersSlice';
import { setCurrentChat } from '../../redux/slices/chatSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Mail, MapPin, Upload, MessageSquare, Edit, Building, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UserProfile = () => {
    const { userId: routeUserId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user: loggedInUser, isLoading: authIsLoading, isAuthenticated } = useSelector(state => state.auth);
    const { selectedUserProfile: profile, isLoading: profileIsLoading, error } = useSelector(state => state.users);
    const isOwnProfile = !!loggedInUser && !!profile && loggedInUser.id === profile._id;

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (authIsLoading) {
            return;
        }
        let userIdToFetch = routeUserId.toLowerCase() === 'me' ? loggedInUser?.id : routeUserId;

        if (routeUserId.toLowerCase() === 'me' && !isAuthenticated) {
            toast.error("Please log in to view your profile.");
            navigate('/login', { replace: true });
            return;
        }
        
        if (userIdToFetch) {
            dispatch(fetchUserById(userIdToFetch));
        } else {
            console.warn("[UserProfile] Could not determine a user ID to fetch.");
        }

        return () => {
            dispatch(clearSelectedUser());
        };
    }, [dispatch, routeUserId, loggedInUser, authIsLoading, isAuthenticated, navigate]);


    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) { handleAvatarUpload(file); }
        if (event.target) { event.target.value = null; }
    };
    
    const handleAvatarUpload = async (fileToUpload) => {
        if (!fileToUpload || !isOwnProfile) return;
        const formData = new FormData();
        formData.append('avatar', fileToUpload);
        setIsUploading(true);
        const uploadToast = toast.loading('Uploading avatar...');
        try {
            await dispatch(updateUserAvatar(formData)).unwrap();
            toast.success('Avatar updated successfully!', { id: uploadToast });
        } catch (uploadError) {
            toast.error(`Upload failed: ${uploadError || 'Unknown error'}`, { id: uploadToast });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleStartChat = () => {
        if (!profile || isOwnProfile || !loggedInUser) return;
        const chatPartnerName = `${profile.name?.first || ''} ${profile.name?.last || ''}`.trim() || profile.email || 'User';
        dispatch(setCurrentChat({ type: 'personal', id: profile._id, name: chatPartnerName }));
        toast.info(`Chat with ${chatPartnerName} opened.`);
    };
    
    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
    };

    if (profileIsLoading || authIsLoading) {
        return <div className="flex justify-center items-center h-screen text-white"><Loader2 className="h-8 w-8 animate-spin" /> Loading Profile...</div>;
    }
    
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-red-400">
                <p className="mb-4">Error loading profile: {error}</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }
    
    if (!profile) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-gray-400">
                <p className="mb-4">User profile not found.</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    const profileName = `${profile.name?.first || ''} ${profile.name?.last || ''}`.trim();

    return (
        <div className="min-h-screen bg-gray-900 text-white pt-24 pb-12">
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-20 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500" />
            </div>
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden animate-fade-in-up">
                    <CardHeader className="bg-gradient-to-r from-gray-800 via-gray-800/80 to-gray-800 p-6 border-b border-gray-700">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative group">
                                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-gray-700 shadow-lg">
                                    <AvatarImage src={profile.avatar?.url} alt={profileName} key={profile.avatar?.url} />
                                    <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-purple-600">
                                        {getInitials(profile.name?.first, profile.name?.last)}
                                    </AvatarFallback>
                                </Avatar>
                                {isOwnProfile && (
                                    <Button
                                        variant="outline" size="icon"
                                        className="absolute bottom-0 right-0 rounded-full bg-gray-700 hover:bg-gray-600 border-gray-600 text-white w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={triggerFileInput}
                                        disabled={isUploading}
                                        title="Change avatar"
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                    </Button>
                                )}
                                <input
                                    type="file" ref={fileInputRef} onChange={handleFileChange}
                                    accept="image/png, image/jpeg, image/gif" className="hidden" disabled={isUploading}
                                />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <CardTitle className="text-3xl font-bold mb-1">{profileName}</CardTitle>
                                <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2">
                                    <Mail className="w-4 h-4" /> {profile.email}
                                </p>
                                <Badge variant="secondary" className="mt-2 capitalize bg-gray-700 text-gray-300 border-gray-600">
                                    {profile.role}
                                </Badge>
                                {profile.location?.city && (
                                    <p className="text-sm text-gray-400 mt-1 flex items-center justify-center md:justify-start gap-1">
                                        <MapPin className="w-3 h-3"/> {profile.location.city}{profile.location.country ? `, ${profile.location.country}` : ''}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 md:ml-auto self-center md:self-start">
                                {isOwnProfile ? (
                                    <Button variant="outline" size="sm" disabled> <Edit className="w-4 h-4 mr-2"/> Edit Profile </Button>
                                ) : (
                                    <Button onClick={handleStartChat} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90" disabled={!profile._id}>
                                        <MessageSquare className="w-4 h-4 mr-2"/> Chat
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {profile.bio && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-300">Bio</h3>
                                <p className="text-gray-400 whitespace-pre-wrap">{profile.bio}</p>
                            </div>
                        )}
                        {profile.skills && profile.skills.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-gray-300">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, index) => (
                                        <Badge key={index} variant="outline" className="bg-gray-700 border-gray-600 text-gray-300">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 text-gray-300">Workspaces</h3>
                            {profile.workspaces && profile.workspaces.length > 0 ? (
                                <ul className="space-y-2">
                                     {profile.workspaces.filter(w => w.workspace).map(({ workspace, role }) => (
                                        <li key={workspace._id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-md hover:bg-gray-700/70 transition-colors">
                                            <Link to={`/workspaces/${workspace._id}`} className="font-medium flex items-center gap-2 hover:text-purple-400">
                                                <Building className="w-4 h-4 text-gray-500"/>
                                                {workspace.name}
                                                {workspace.settings?.isPrivate && <Lock className="w-3 h-3 text-gray-500 ml-1" />}
                                            </Link>
                                            <Badge variant="secondary" className="capitalize bg-gray-600 text-gray-300 border-gray-500">{role}</Badge>
                                        </li>
                                    ))}
                                     {profile.workspaces.filter(w => !w.workspace).length > 0 && (
                                        <li className="text-gray-500 italic">Some workspace data could not be loaded.</li>
                                    )}
                                </ul>
                            ) : (
                                <p className="text-gray-500 italic">Not a member of any workspaces.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserProfile;