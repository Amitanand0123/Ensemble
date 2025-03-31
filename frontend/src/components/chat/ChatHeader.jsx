import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Users, Briefcase, User } from "lucide-react";
import { fetchUserById, selectUserById } from "../../redux/slices/usersSlice";

const ChatHeader = ({ chatType, targetId }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUserById(targetId));
  const workspaces = useSelector(state => state.workspaces?.workspaces || {});
  const projects = useSelector(state => state.projects?.projects || {});
  const isLoadingUsers = useSelector(state => state.users.isLoading);

  // Fetch user data if not available and it's a personal chat
  useEffect(() => { 
    if (chatType === 'personal' && !user && targetId) {
      dispatch(fetchUserById(targetId));
    }
  }, [chatType, user, targetId, dispatch]);

  const getTitle = () => {
    if (chatType === 'personal') {
      if (isLoadingUsers) return 'Loading...';
      return user ? user.name : 'User Chat';
    } else if (chatType === 'workspace') {
      const workspace = workspaces[targetId];
      return workspace ? workspace.name : 'Loading...';
    } else if (chatType === 'project') {
      const project = projects[targetId];
      return project ? project.name : 'Loading...';
    }
    return 'Chat';
  };

  const getIcon = () => {
    if (chatType === 'personal') {
      return <User className="h-5 w-5" />;
    } else if (chatType === 'workspace') {
      return <Users className="h-5 w-5" />;
    } else if (chatType === 'project') {
      return <Briefcase className="h-5 w-5" />;
    }
  };

  return (
    <div className="border-b border-gray-700 p-4">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
          {chatType === 'personal' ? (
            <div className="text-lg font-bold">{getTitle().charAt(0)}</div>
          ) : (
            <div className="text-white">
              {getIcon()}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-bold">{getTitle()}</h2>
          <p className="text-sm text-gray-400">
            {chatType === 'personal' ? 'Personal Chat' : chatType === 'workspace' ? 'Workspace Chat' : 'Project Chat'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;