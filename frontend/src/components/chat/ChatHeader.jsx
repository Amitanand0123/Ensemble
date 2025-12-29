import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Users, Briefcase, User } from "lucide-react";
import { fetchUserById, selectUserById } from "../../redux/slices/usersSlice";
import PropTypes from 'prop-types';

const ChatHeader = ({ chatType, targetId }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUserById(targetId));
  const workspaces = useSelector(state => state.workspaces?.workspaces || {});
  const projects = useSelector(state => state.projects?.projects || {});
  const isLoadingUsers = useSelector(state => state.users.isLoading);

  
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
    <div className="border-b-2 border-border p-4 bg-sidebar">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-accent border border-accent/50 flex items-center justify-center">
          {chatType === 'personal' ? (
            <div className="text-lg font-bold text-white">{getTitle().charAt(0)}</div>
          ) : (
            <div className="text-white">
              {getIcon()}
            </div>
          )}
        </div>
        <div>
          <h2 className="font-bold text-sidebar-text">{getTitle()}</h2>
          <p className="text-sm text-sidebar-textMuted">
            {chatType === 'personal' ? 'Personal Chat' : chatType === 'workspace' ? 'Workspace Chat' : 'Project Chat'}
          </p>
        </div>
      </div>
    </div>
  );
};

ChatHeader.propTypes = {
  chatType: PropTypes.oneOf(['personal', 'workspace', 'project']).isRequired,
  targetId: PropTypes.string.isRequired,
};

export default ChatHeader;