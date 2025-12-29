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
        return (
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-muted-foreground">Loading Profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] bg-background">
                <div className="text-center p-6 bg-card border-2 border-destructive/50 rounded-xl max-w-md">
                    <p className="text-destructive font-medium mb-4">Error loading profile: {error}</p>
                    <Button onClick={() => navigate(-1)} className="bg-primary hover:bg-primary/90">Go Back</Button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] bg-background">
                <div className="text-center p-6 bg-card border-2 border-border rounded-xl max-w-md">
                    <p className="text-muted-foreground mb-4">User profile not found.</p>
                    <Button onClick={() => navigate(-1)} className="bg-primary hover:bg-primary/90">Go Back</Button>
                </div>
            </div>
        );
    }

    const profileName = `${profile.name?.first || ''} ${profile.name?.last || ''}`.trim();

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute right-0 top-20 w-96 h-96 bg-chart-1/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute left-0 bottom-20 w-80 h-80 bg-chart-3/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
            </div>
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <Card className="bg-card/60 backdrop-blur-sm rounded-xl border-2 border-border shadow-lg overflow-hidden animate-fadeInUp">
                    <CardHeader className="bg-accent/20 p-6 border-b-2 border-border">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative group">
                                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-border shadow-xl">
                                    <AvatarImage src={profile.avatar?.url} alt={profileName} key={profile.avatar?.url} />
                                    <AvatarFallback className="text-4xl bg-gradient-to-br from-chart-1 to-chart-3 text-white">
                                        {getInitials(profile.name?.first, profile.name?.last)}
                                    </AvatarFallback>
                                </Avatar>
                                {isOwnProfile && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute bottom-0 right-0 rounded-full bg-card hover:bg-accent border-border text-foreground w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
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
                                <CardTitle className="text-2xl lg:text-3xl font-bold mb-2 text-foreground">{profileName}</CardTitle>
                                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2 text-sm">
                                    <Mail className="w-4 h-4" /> {profile.email}
                                </p>
                                <Badge variant="secondary" className="mt-3 capitalize bg-primary/10 text-primary border border-primary/30 font-semibold">
                                    {profile.role}
                                </Badge>
                                {profile.location?.city && (
                                    <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center md:justify-start gap-1.5">
                                        <MapPin className="w-3.5 h-3.5"/> {profile.location.city}{profile.location.country ? `, ${profile.location.country}` : ''}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 md:ml-auto self-center md:self-start">
                                {isOwnProfile ? (
                                    <Button variant="outline" size="sm" disabled className="border-border hover:bg-accent">
                                        <Edit className="w-4 h-4 mr-2"/> Edit Profile
                                    </Button>
                                ) : (
                                    <Button onClick={handleStartChat} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg" disabled={!profile._id}>
                                        <MessageSquare className="w-4 h-4 mr-2"/> Chat
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {profile.bio && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-foreground">Bio</h3>
                                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
                            </div>
                        )}
                        {profile.skills && profile.skills.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-foreground">Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill, index) => (
                                        <Badge key={index} variant="outline" className="bg-chart-1/10 border border-chart-1/30 text-chart-1 font-medium px-3 py-1">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 text-foreground">Workspaces</h3>
                            {profile.workspaces && profile.workspaces.length > 0 ? (
                                <ul className="space-y-2">
                                     {profile.workspaces.filter(w => w.workspace).map(({ workspace, role }) => (
                                        <li key={workspace._id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg border border-border hover:bg-accent/50 hover:border-primary/30 transition-all">
                                            <Link to={`/workspaces/${workspace._id}`} className="font-medium flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                                                <Building className="w-4 h-4 text-muted-foreground"/>
                                                {workspace.name}
                                                {workspace.settings?.isPrivate && <Lock className="w-3 h-3 text-muted-foreground ml-1" />}
                                            </Link>
                                            <Badge variant="secondary" className="capitalize bg-chart-2/10 text-chart-2 border border-chart-2/30 font-medium">{role}</Badge>
                                        </li>
                                    ))}
                                     {profile.workspaces.filter(w => !w.workspace).length > 0 && (
                                        <li className="text-muted-foreground italic text-sm">Some workspace data could not be loaded.</li>
                                    )}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground italic">Not a member of any workspaces.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserProfile;