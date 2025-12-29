import { XCircle, CheckCircle, AlertCircle } from 'lucide-react';
import PropTypes from 'prop-types';

const Alert = ({ type, message }) => {
    if (!message) return null;

    const alertStyles = {
        success: 'bg-secondary/10 border-2 border-secondary text-secondary',
        error: 'bg-destructive/10 border-2 border-destructive text-destructive',
        warning: 'bg-chart-4/10 border-2 border-chart-4 text-chart-4',
        info: 'bg-primary/10 border-2 border-primary text-primary'
    };

    const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : AlertCircle;

    return (
        <div className={`px-4 py-3 rounded-lg relative mb-4 ${alertStyles[type]}`} role="alert">
            <div className="flex items-center">
                <Icon className="w-5 h-5 mr-2" />
                <span className="block sm:inline font-medium">
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