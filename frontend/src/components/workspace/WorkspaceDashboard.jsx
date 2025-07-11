import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWorkspaces, joinWorkspace, createWorkspace } from '../../redux/slices/workspaceSlice.js';
import { Plus, Users, ArrowRight, Search, Lock, Globe, LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

const WorkspaceDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { workspaces = [], isLoading, error } = useSelector(state => state.workspaces);
    const { isAdmin } = useSelector(state => state.auth);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        dispatch(fetchWorkspaces());
    }, [dispatch]);

    const filteredWorkspaces = workspaces?.filter(ws =>
        ws.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if(isLoading && workspaces.length === 0){
         return (
             <div className="flex justify-center items-center h-screen text-white">
                 Loading workspaces...
             </div>
         );
    }

    if (error) {
         return (
             <div className="flex justify-center items-center h-screen text-red-500">
                 Error loading workspaces: {error.message || 'Unknown error'}
             </div>
         );
    }


    return (
        <div className="min-h-screen bg-gray-900 text-white pt-32">
             {/* Background elements */}
             <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-20 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold">My Workspaces</h1>
                    <div className="flex gap-4">
                       {/* Join Workspace Button (Visible to all logged-in users) */}
                       <button
                            onClick={() => setIsJoinModalOpen(true)}
                            className="px-4 py-2 rounded-full border border-gray-600 hover:bg-gray-700/50 transition-colors flex items-center gap-2"
                        >
                            <LogIn className="w-5 h-5" />
                            Join Workspace
                        </button>
                       {/* Create Workspace Button (Visible only to Admins) */}
                       {isAdmin && (
                           <button
                               onClick={() => setIsCreateModalOpen(true)}
                               className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-all duration-300 flex items-center gap-2"
                           >
                               <Plus className="w-5 h-5" />
                               New Workspace
                           </button>
                       )}
                   </div>
                </div>

                {/* Search Input */}
                 <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search workspaces..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700 focus:outline-none focus:border-purple-500 transition-all duration-300"
                    />
                </div>

                {/* Workspaces Grid */}
                {filteredWorkspaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
                        {filteredWorkspaces.map((workspace) => (
                            <div
                                key={workspace._id}
                                onClick={() => navigate(`/workspaces/${workspace._id}`)} // Navigate to detail page
                                className="group bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-purple-500 transition-all duration-300 cursor-pointer animate-fade-in-up"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-semibold group-hover:text-purple-400 transition-colors">{workspace.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        {workspace.settings?.isPrivate ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                    </div>
                                </div>
                                <p className="text-gray-400 mb-4 text-sm line-clamp-2 h-10">{workspace.description || 'No description available.'}</p> {/* Fixed height and line clamp */}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>{workspace.members?.length || 0} members</span>
                                    </div>
                                    <ArrowRight className="w-5 h-5 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                         {searchQuery ? 'No workspaces match your search.' : 'You are not part of any workspaces yet.'}
                     </div>
                )}
            </div>

             {/* --- Modals --- */}
             <CreateWorkspaceModal
                 isOpen={isCreateModalOpen}
                 onClose={() => setIsCreateModalOpen(false)}
             />
             <JoinWorkspaceModal
                isOpen={isJoinModalOpen}
                onClose={() => setIsJoinModalOpen(false)}
             />

        </div>
    );
};


const CreateWorkspaceModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setModalError('Workspace name cannot be empty.');
            toast.error('Workspace name cannot be empty.');
            return;
        }
        setLoading(true);
        setModalError('');
        try{
            await dispatch(createWorkspace({ name, description, isPrivate })).unwrap();
            toast.success('Workspace created!');
            setName('');
            setDescription('');
            setIsPrivate(false);
            onClose();
        }catch (err){
            const errorMessage = err.message || 'Failed to create workspace.';
            setModalError(errorMessage);
            console.error("Create Workspace Error:", err);
            toast.error(errorMessage);
        }finally{
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-white">Create New Workspace</h2>
                {modalError && <p className="text-red-500 text-sm mb-4">{modalError}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Input fields for name, description, isPrivate */}
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Name*</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                            required
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                            rows="3"
                        />
                    </div>
                     <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isPrivateModal" // Use unique ID
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className="rounded border-gray-600 text-purple-500 focus:ring-purple-500 bg-gray-700"
                        />
                        <label htmlFor="isPrivateModal" className="text-sm text-gray-300">Make workspace private</label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-all"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


 const JoinWorkspaceModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setModalError('');
        try {
            await dispatch(joinWorkspace(inviteCode)).unwrap();
            setInviteCode('');
            onClose(); // Close modal on success
        } catch (err) {
            setModalError(err.message || 'Failed to join workspace. Check the code.');
            console.error("Join Workspace Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-white">Join Workspace</h2>
                {modalError && <p className="text-red-500 text-sm mb-4">{modalError}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Invite Code*</label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            placeholder="Enter the workspace invite code"
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-all"
                            disabled={loading}
                        >
                            {loading ? 'Joining...' : 'Join'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

CreateWorkspaceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

JoinWorkspaceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};


export default WorkspaceDashboard;