import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { joinWorkspace } from '../../redux/slices/workspaceSlice.js';
import { LogIn, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';

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
            onClose();
            toast.success('Successfully joined workspace!');
        } catch (err) {
            setModalError(err.message || 'Failed to join workspace. Check the code.');
            console.error("Join Workspace Error:", err);
            toast.error(err.message || 'Failed to join workspace');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeInUp">
             <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl p-6 lg:p-8 w-full max-w-lg border-2 border-gray-700 shadow-2xl">
                <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-white">Join Workspace</h2>
                <p className="text-gray-300 mb-6 text-sm">Enter the invite code to join an existing workspace</p>
                {modalError && <div className="bg-destructive/10 border border-destructive/50 text-destructive text-sm p-3 rounded-lg mb-4">{modalError}</div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                     <div>
                        <label className="block text-sm font-semibold text-white mb-2">Invite Code*</label>
                        <input
                            type="text"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                            placeholder="Enter the workspace invite code"
                            className="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg border-2 border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 font-mono"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg border-2 border-gray-600 bg-gray-200 text-gray-900 hover:bg-gray-300 hover:border-gray-500 transition-all font-medium"
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
                                    Joining...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Join
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

JoinWorkspaceModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default JoinWorkspaceModal;
