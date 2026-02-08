import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { createWorkspace } from '../../redux/slices/workspaceSlice.js';
import { Plus, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

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

    return createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
            <div className="bg-card backdrop-blur-sm rounded-xl p-6 lg:p-8 w-full max-w-lg border-2 border-border shadow-2xl">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-foreground">Create New Workspace</h2>
                <p className="text-muted-foreground mb-6 text-sm">Set up a new workspace for your team</p>
                {modalError && <div className="bg-destructive/10 border border-destructive/50 text-destructive text-sm p-3 rounded-lg mb-4">{modalError}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Input fields for name, description, isPrivate */}
                     <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Workspace Name*</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Marketing Team"
                            className="w-full px-4 py-2.5 bg-muted text-foreground rounded-lg border-2 border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                            required
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the workspace..."
                            className="w-full px-4 py-2.5 bg-muted text-foreground rounded-lg border-2 border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground resize-none"
                            rows="3"
                        />
                    </div>
                     <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg border border-border">
                        <input
                            type="checkbox"
                            id="isPrivateModal"
                            checked={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary/20 bg-muted"
                        />
                        <label htmlFor="isPrivateModal" className="text-sm text-foreground font-medium flex items-center gap-2">
                            <Lock className="w-4 h-4 text-primary" />
                            Make workspace private
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg border-2 border-border bg-muted text-foreground hover:bg-muted/80 hover:border-border transition-all font-medium"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Create
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

CreateWorkspaceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default CreateWorkspaceModal;
