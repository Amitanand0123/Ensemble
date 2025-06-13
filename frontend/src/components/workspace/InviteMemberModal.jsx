
import { useState, useEffect } from 'react'; 
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';

const InviteMemberModal = ({ contextType, contextId, isOpen, onClose, onInviteSuccess, availableRoles }) => {
    
    const defaultRole = (availableRoles && availableRoles.length > 0) ? availableRoles[0].value : '';
    const [email, setEmail] = useState('');
    const [role, setRole] = useState(defaultRole);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const token = useSelector((state) => state.auth.token); 

    const apiPath = contextType === 'workspace' ? 'workspaces' : 'projects';

    const handleSubmit = async (e) => {
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

    
    useEffect(() => {
        if (isOpen) {
            const newDefaultRole = (availableRoles && availableRoles.length > 0) ? availableRoles[0].value : '';
            setEmail('');
            setRole(newDefaultRole);
            setError('');
            setIsLoading(false);
        }
    }, [isOpen, availableRoles]);


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-gray-700">
                <DialogHeader>
                    <DialogTitle>Invite Member to {contextType === 'workspace' ? 'Workspace' : 'Project'}</DialogTitle>
                     <DialogClose asChild>
                        {/* Use standard DialogClose trigger or a simple button */}
                        <Button className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                         </Button>
                     </DialogClose>
                </DialogHeader>
                {error && (
                    <Alert variant="destructive" className="mb-4 bg-red-900/30 border-red-700 text-red-300">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email-invite" className="text-right col-span-1"> {/* Changed htmlFor */}
                            Email
                        </Label>
                        <Input
                            id="email-invite" 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="member@example.com"
                            className="col-span-3 bg-gray-700 border-gray-600 focus:border-purple-500" 
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role-invite" className="text-right col-span-1"> {/* Changed htmlFor */}
                            Role
                        </Label>
                        {/* Ensure availableRoles is an array before mapping */}
                        {Array.isArray(availableRoles) && availableRoles.length > 0 ? (
                            <Select value={role} onValueChange={setRole}>
                                <SelectTrigger id="role-invite" className="col-span-3 bg-gray-700 border-gray-600 focus:border-purple-500"> {/* Changed ID */}
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-700 text-white border-gray-600">
                                    {availableRoles.map(r => (
                                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                         ) : (
                            <p className="col-span-3 text-sm text-gray-500">No roles available</p> 
                         )}
                    </div>
                     <DialogFooter className="mt-4"> {/* Added margin-top */}
                         <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90">
                            {isLoading ? 'Sending...' : 'Send Invitation'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

InviteMemberModal.propTypes={
    isOpen:PropTypes.bool,
    onClose:PropTypes.func,
    contextType:PropTypes.string,
    contextId:PropTypes.string,
    availableRoles:PropTypes.array,
    onInviteSuccess:PropTypes.func
}

export default InviteMemberModal;