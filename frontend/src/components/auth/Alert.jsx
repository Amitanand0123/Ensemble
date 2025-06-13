import { XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const Alert = ({ type, message }) => {
    if (!message) return null;

    const alertStyles = {
        success: 'bg-green-100 border-green-400 text-green-700',
        error: 'bg-red-100 border-red-400 text-red-700',
        warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
        info: 'bg-blue-100 border-blue-400 text-blue-700'
    };

    const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertCircle;

    return (
        <div className={`border px-4 py-3 rounded relative mb-4 ${alertStyles[type]}`} role="alert">
            <div className="flex items-center">
                <Icon className="w-5 h-5 mr-2" />
                <span className="block sm:inline">
                    {typeof message === 'string' ? message : JSON.stringify(message)}
                </span>
            </div>
        </div>
    );
};

Alert.propTypes = {
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
    message: PropTypes.string.isRequired
};

export default Alert;