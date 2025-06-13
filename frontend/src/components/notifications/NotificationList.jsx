import { useNotification } from '../../hooks/useNotification.js'
import NotificationItem from './NotificationItem.jsx'
import { Button } from '../ui/button'


const NotificationList=()=>{
    const {notifications,unreadCount,isLoading,error,filter,setFilter,markAllRead}=useNotification()

    if(isLoading) return <div>Loading notifications...</div>

    if(error){
        return <div>Error loading notifications</div>
    }

    return (
        <div>
            <div>
                <h2>
                    Notifications {unreadCount>0 && `(${unreadCount})`}
                </h2>
                <Button onClick={markAllRead} disabled={unreadCount===0}>
                    Mark all as read
                </Button>
            </div>
            <div>
                <select value={filter} onChange={(e)=>setFilter(e.target.value)} >
                    <option value="all">All</option>
                    <option value="unread">Unread</option>
                    <option value="workspace_invite">Workspace</option>
                    <option value="project_invite">Project</option>
                    <option value="task_assignment">Tasks</option>
                    <option value="mention">Mentions</option>
                </select>
            </div>
            <div>
                {notifications.length===0?(
                    <div>No notifications</div>
                ):(
                    notifications.map((notification)=>(
                        <NotificationItem key={notification._id} notification={notification} />
                    ))
                )}
            </div>
        </div>
    )
}

export default NotificationList