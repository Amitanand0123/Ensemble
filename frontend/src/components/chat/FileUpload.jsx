import { useChatSocket } from '../../hooks/useChatSocket';
import { Paperclip } from 'lucide-react';
import PropTypes from 'prop-types';

const FileUpload = ({ chatType, targetId, setIsUploading }) => {
  const { uploadChatFile } = useChatSocket(localStorage.getItem('token'));

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      let userId, projectId, workspaceId;
      
      if (chatType === 'personal') {
        userId = targetId;
      } else if (chatType === 'project') {
        projectId = targetId;
      } else if (chatType === 'workspace') {
        workspaceId = targetId;
      }
      
      await uploadChatFile(file, chatType, userId, projectId, workspaceId);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
      />
      <label htmlFor="file-upload" className="cursor-pointer p-2 hover:bg-accent rounded-full">
        <Paperclip className="h-5 w-5 text-muted-foreground" />
      </label>
    </div>
  );
};

FileUpload.propTypes = {
  chatType: PropTypes.string.isRequired,
  targetId: PropTypes.string.isRequired,
  setIsUploading: PropTypes.func.isRequired,
};

export default FileUpload;
