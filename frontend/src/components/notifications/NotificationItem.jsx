import { useNotification } from '../../hooks/useNotification.js'
import {formatDistanceToNow} from 'date-fns'
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types';

const NotificationItem=({notification})=>{
    const {markAsRead}=useNotification()
    const handleClick=()=>{
        if(!notification.read){
            markAsRead(notification._id)
        }
    }

    const getIcon=(type)=>{
        switch(type){
            case 'workspace_invite':
                return '👥';
            case 'project_invite':
                return '📋';
            case 'task_assignment':
                return '✅';
            case 'mention':
                return '@';
            case 'deadline':
                return '⏰';
            case 'comment':
                return '💬';
            default:
                return '📌';
        }
    }
          
    return (
        <Link to={notification.link || '#'} className='' onClick={handleClick}>
            <div>
                <span>{getIcon(notification.type)}</span>
                <div>
                    <p>{notification.message}</p>
                    <p>{formatDistanceToNow(new Date(notification.date),{addSuffix:true})}</p>
                </div>
                {!notification.read && (
                    <span className=''></span>
                )}
            </div>
        </Link>
    )
}

NotificationItem.propTypes={
    notification:PropTypes.object.isRequired
}

export default NotificationItem