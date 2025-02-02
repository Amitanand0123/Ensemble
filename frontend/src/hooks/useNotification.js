import {useState,useEffect} from 'react'
import {useDispatch,useSelector} from 'react-redux'
import {fetchNotifications,markNotificationAsRead,markAllNotificationsAsRead} from '../redux/slices/notificationSlice.js'

export const useNotification=()=>{
    const dispatch=useDispatch()
    const {notifications,unreadCount,isLoading,error}=useSelector(
        (state)=>state.notifications
    )
    const [filter,setFilter]=useState('all')

    useEffect(()=>{
        dispatch(fetchNotifications())
    },[dispatch])

    const markAsRead=async(notificationId)=>{
        await dispatch(markNotificationAsRead(notificationId))
    }

    const markAllRead=async()=>{
        await dispatch(markAllNotificationsAsRead())
    }

    const filteredNotifications=notifications.filter((notification)=>{
        if(filter==='all') return true;
        if(filter==='unread') return !notification.read;
        return notification.type===filter;
    })

    return {notifications:filteredNotifications,unreadCount,isLoading,error,filter,setFilter,markAsRead,markAllRead}
}