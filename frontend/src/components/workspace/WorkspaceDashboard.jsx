import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchWorkspaces } from '../../redux/slices/workspaceSlice.js';
import { Plus, Users, ArrowRight, Search, Lock, Globe, LogIn, Loader2 } from 'lucide-react';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import JoinWorkspaceModal from './JoinWorkspaceModal';

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
             <div className="flex justify-center items-center min-h-screen bg-background">
                 <div className="flex flex-col items-center gap-3">
                     <Loader2 className="w-8 h-8 animate-spin text-primary" />
                     <p className="text-muted-foreground">Loading workspaces...</p>
                 </div>
             </div>
         );
    }

    if (error && error.message !== 'Invalid token') {
         return (
             <div className="flex justify-center items-center min-h-screen bg-background">
                 <div className="text-center p-8 bg-card/50 border-2 border-border rounded-xl max-w-md shadow-2xl">
                     <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                         <Users className="w-8 h-8 text-primary-foreground" />
                     </div>
                     <p className="text-foreground font-semibold text-lg mb-2">Unable to load workspaces</p>
                     <p className="text-muted-foreground text-sm">{error.message || 'Please try refreshing the page'}</p>
                     <button
                         onClick={() => dispatch(fetchWorkspaces())}
                         className="mt-6 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
                     >
                         Try Again
                     </button>
                 </div>
             </div>
         );
    }


    return (
        <div className="min-h-screen bg-background">
             {/* Background elements - Slack teal and purple glows */}
             <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute right-0 top-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute left-0 bottom-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">My Workspaces</h1>
                        <p className="text-muted-foreground mt-1">Manage and collaborate across all your workspaces</p>
                    </div>
                    <div className="flex gap-3">
                       {/* Join Workspace Button (Visible to all logged-in users) */}
                       <button
                            onClick={() => setIsJoinModalOpen(true)}
                            className="px-4 py-2.5 rounded-lg border-2 border-border hover:border-primary/50 hover:bg-primary/10 transition-all flex items-center gap-2 font-medium text-sm"
                        >
                            <LogIn className="w-4 h-4" />
                            <span className="hidden sm:inline">Join Workspace</span>
                        </button>
                       {/* Create Workspace Button (Visible only to Admins) */}
                       {isAdmin && (
                           <button
                               onClick={() => setIsCreateModalOpen(true)}
                               className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm"
                           >
                               <Plus className="w-4 h-4" />
                               <span className="hidden sm:inline">New Workspace</span>
                           </button>
                       )}
                   </div>
                </div>

                {/* Search Input */}
                 <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search workspaces..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                {/* Workspaces Grid */}
                {filteredWorkspaces.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 pb-12">
                        {filteredWorkspaces.map((workspace, index) => (
                            <div
                                key={workspace._id}
                                onClick={() => navigate(`/workspaces/${workspace._id}`)}
                                className="group bg-card/60 backdrop-blur-sm rounded-xl border-2 border-border p-6 hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer animate-fadeInUp ensemble-hover-lift"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{workspace.name}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground p-2 rounded-lg bg-primary/10 border border-primary/20">
                                        {workspace.settings?.isPrivate ? <Lock className="w-4 h-4 text-primary" /> : <Globe className="w-4 h-4 text-secondary" />}
                                    </div>
                                </div>
                                <p className="text-muted-foreground mb-5 text-sm line-clamp-2 h-10 leading-relaxed">{workspace.description || 'No description available.'}</p>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                                        <div className="p-1.5 rounded-md bg-primary">
                                            <Users className="w-4 h-4 text-primary-foreground" />
                                        </div>
                                        <span className="font-medium">{workspace.members?.length || 0} members</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-primary font-medium">
                                        <span className="text-sm">View</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="max-w-lg mx-auto bg-card/50 border-2 border-dashed border-border rounded-xl p-10 shadow-xl">
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                <Users className="w-10 h-10 text-primary-foreground" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground mb-3">
                                {searchQuery ? 'No workspaces found' : 'Welcome to Ensemble!'}
                            </h3>
                            <p className="text-muted-foreground text-base mb-6">
                                {searchQuery
                                    ? 'Try adjusting your search criteria'
                                    : 'Get started by creating a new workspace or joining an existing one to collaborate with your team'}
                            </p>
                            {!searchQuery && (
                                <div className="flex gap-3 justify-center flex-wrap">
                                    {isAdmin && (
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Create Workspace
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsJoinModalOpen(true)}
                                        className="px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary/10 transition-all flex items-center gap-2 font-semibold hover:shadow-lg"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        Join Workspace
                                    </button>
                                </div>
                            )}
                        </div>
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

export default WorkspaceDashboard;
