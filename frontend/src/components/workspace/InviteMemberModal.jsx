import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from 'react-hot-toast';
import { X, Search, Loader2, Mail, Users as UsersIcon } from 'lucide-react';
import PropTypes from 'prop-types';

const InviteMemberModal = ({ contextType, contextId, isOpen, onClose, onInviteSuccess, availableRoles }) => {

    const defaultRole = (availableRoles && availableRoles.length > 0) ? availableRoles[0].value : '';
    const [activeTab, setActiveTab] = useState('search');

    const [email, setEmail] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const [role, setRole] = useState(defaultRole);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const token = useSelector((state) => state.auth.token);

    const apiPath = contextType === 'workspace' ? 'workspaces' : 'projects';

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.trim().length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        setError('');
        try {
            const response = await axios.get(
                `/api/users/search?query=${encodeURIComponent(query)}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSearchResults(response.data.users || []);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to search users');
        } finally {
            setIsSearching(false);
        }
    };

    const handleEmailInvite = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!email) {
            setError('Email address is required.');
            setIsLoading(false);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `/api/${apiPath}/${contextId}/members/invite`,
                { email, role },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success(response.data.message || 'Invitation sent successfully!');
                setEmail('');
                setRole(defaultRole);
                if (onInviteSuccess) {
                    onInviteSuccess();
                }
                onClose();
            } else {
                throw new Error(response.data.message || 'Failed to send invitation.');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'An error occurred.';
            setError(errorMsg);
            console.error('Invitation error:', err.response || err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async () => {
        if (!selectedUser) {
            setError('Please select a user');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(
                `/api/${apiPath}/${contextId}/members/add`,
                { userId: selectedUser._id, role },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success(`${selectedUser.name?.first || selectedUser.email} added successfully!`);
                setSelectedUser(null);
                setSearchQuery('');
                setSearchResults([]);
                setRole(defaultRole);
                if (onInviteSuccess) {
                    onInviteSuccess();
                }
                onClose();
            } else {
                throw new Error(response.data.message || 'Failed to add member.');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'An error occurred.';
            setError(errorMsg);
            console.error('Add member error:', err.response || err);
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (user) => {
        if (user.name?.first && user.name?.last) {
            return `${user.name.first.charAt(0)}${user.name.last.charAt(0)}`.toUpperCase();
        }
        return user.email?.charAt(0).toUpperCase() || '?';
    };

    const getUserName = (user) => {
        if (user.name?.first || user.name?.last) {
            return `${user.name?.first || ''} ${user.name?.last || ''}`.trim();
        }
        return user.email;
    };

    useEffect(() => {
        if (isOpen) {
            const newDefaultRole = (availableRoles && availableRoles.length > 0) ? availableRoles[0].value : '';
            setEmail('');
            setSearchQuery('');
            setSearchResults([]);
            setSelectedUser(null);
            setRole(newDefaultRole);
            setError('');
            setIsLoading(false);
            setActiveTab('search');
        }
    }, [isOpen, availableRoles]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[550px] bg-card backdrop-blur-sm text-foreground border-2 border-border">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-foreground">Invite Member to {contextType === 'workspace' ? 'Workspace' : 'Project'}</DialogTitle>
                    <DialogClose asChild>
                        <Button className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100" variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </DialogClose>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive text-destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-muted">
                        <TabsTrigger value="search" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                            <UsersIcon className="w-4 h-4 mr-2" />
                            Search Users
                        </TabsTrigger>
                        <TabsTrigger value="email" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                            <Mail className="w-4 h-4 mr-2" />
                            Invite by Email
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="search" className="space-y-4 mt-4">
                        {/* Search Input */}
                        <div className="space-y-2">
                            <Label htmlFor="user-search" className="text-foreground">Search for existing users</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="user-search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="pl-10 bg-muted text-foreground border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                                />
                                {isSearching && (
                                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
                                )}
                            </div>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="max-h-60 overflow-y-auto space-y-2 border-2 border-border rounded-lg p-2 bg-muted/50">
                                {searchResults.map((user) => (
                                    <button
                                        key={user._id}
                                        type="button"
                                        onClick={() => setSelectedUser(user)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                                            selectedUser?._id === user._id
                                                ? 'bg-primary/20 text-foreground'
                                                : 'hover:bg-muted text-foreground'
                                        }`}
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar?.url} alt={getUserName(user)} />
                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                {getInitials(user)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-sm">{getUserName(user)}</p>
                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {searchQuery.trim().length >= 2 && !isSearching && searchResults.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
                        )}

                        {/* Selected User Card */}
                        {selectedUser && (
                            <div className="bg-primary/10 border-2 border-primary/50 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground mb-2">Selected User:</p>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={selectedUser.avatar?.url} alt={getUserName(selectedUser)} />
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {getInitials(selectedUser)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">{getUserName(selectedUser)}</p>
                                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedUser(null)}
                                        className="text-foreground hover:bg-muted"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Role Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="role-search" className="text-foreground">Assign Role</Label>
                            {Array.isArray(availableRoles) && availableRoles.length > 0 ? (
                                <Select value={role} onValueChange={setRole}>
                                    <SelectTrigger id="role-search" className="bg-muted text-foreground border-2 border-border focus:border-primary">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border text-foreground">
                                        {availableRoles.map(r => (
                                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-sm text-muted-foreground">No roles available</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="border-2 border-border bg-muted text-foreground hover:bg-muted/80 hover:border-border font-medium">
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={handleAddUser}
                                disabled={isLoading || !selectedUser}
                                className="bg-primary hover:bg-primary/90"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    'Add Member'
                                )}
                            </Button>
                        </DialogFooter>
                    </TabsContent>

                    <TabsContent value="email" className="space-y-4 mt-4">
                        <form onSubmit={handleEmailInvite} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email-invite" className="text-foreground">Email Address</Label>
                                <Input
                                    id="email-invite"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="member@example.com"
                                    className="bg-muted text-foreground border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">An invitation email will be sent to this address</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role-email" className="text-foreground">Assign Role</Label>
                                {Array.isArray(availableRoles) && availableRoles.length > 0 ? (
                                    <Select value={role} onValueChange={setRole}>
                                        <SelectTrigger id="role-email" className="bg-muted text-foreground border-2 border-border focus:border-primary">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border text-foreground">
                                            {availableRoles.map(r => (
                                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No roles available</p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="border-2 border-border bg-muted text-foreground hover:bg-muted/80 hover:border-border font-medium">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Invitation'
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

InviteMemberModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func,
    contextType: PropTypes.string,
    contextId: PropTypes.string,
    availableRoles: PropTypes.array,
    onInviteSuccess: PropTypes.func
};

export default InviteMemberModal;
