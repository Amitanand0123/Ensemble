import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, Settings, Users, FolderGit, ArrowRight, Search, 
  Calendar, CheckCircle, Mail, Lock, Globe, MoreVertical,
  Clock, AlertCircle, MessageSquare, File
} from 'lucide-react';


const workspaceActions = {
  fetchWorkspaces: () => ({ type: 'workspaces/fetch' }),
  createWorkspace: (data) => ({ type: 'workspaces/create', payload: data }),
  updateWorkspace: (id, data) => ({ type: 'workspaces/update', payload: { id, data } }),
  deleteWorkspace: (id) => ({ type: 'workspaces/delete', payload: id }),
  inviteMember: (id, email) => ({ type: 'workspaces/invite', payload: { id, email } }),
};

export const WorkspaceDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkspaceData, setNewWorkspaceData] = useState({
    name: '',
    description: '',
    isPrivate: false
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { workspaces, isLoading } = useSelector((state) => state.workspaces);

  useEffect(() => {
    dispatch(workspaceActions.fetchWorkspaces());
  }, [dispatch]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
      await dispatch(workspaceActions.createWorkspace(newWorkspaceData)).unwrap();
      setIsCreateModalOpen(false);
      setNewWorkspaceData({ name: '', description: '', isPrivate: false });
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  const filteredWorkspaces = workspaces?.filter(workspace =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-500" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Workspaces</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-all duration-300 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Workspace
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700 focus:outline-none focus:border-purple-500 transition-all duration-300"
            />
          </div>

          {/* Workspaces Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredWorkspaces?.map((workspace) => (
              <div
                key={workspace._id}
                onClick={() => navigate(`/workspace/${workspace._id}`)}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:border-purple-500 transition-all duration-300 cursor-pointer animate-fade-in-up"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">{workspace.name}</h3>
                  <div className="flex items-center gap-2">
                    {workspace.settings?.isPrivate ? (
                      <Lock className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Globe className="w-4 h-4 text-gray-400" />
                    )}
                    <Settings className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>
                <p className="text-gray-400 mb-4 line-clamp-2">{workspace.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-5 h-5" />
                    <span>{workspace.members?.length || 0} members</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New Workspace</h2>
            <form onSubmit={handleCreateWorkspace}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Workspace Name</label>
                  <input
                    type="text"
                    value={newWorkspaceData.name}
                    onChange={(e) => setNewWorkspaceData({ ...newWorkspaceData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={newWorkspaceData.description}
                    onChange={(e) => setNewWorkspaceData({ ...newWorkspaceData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:border-purple-500"
                    rows="3"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newWorkspaceData.isPrivate}
                    onChange={(e) => setNewWorkspaceData({ ...newWorkspaceData, isPrivate: e.target.checked })}
                    className="rounded border-gray-600 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="isPrivate" className="text-sm">Make workspace private</label>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold hover:opacity-90 transition-all"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};