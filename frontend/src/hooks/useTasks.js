import { useEffect,useState } from "react";
import axios from "axios";
import { bulkUpdateTasks, createTask, deleteTask, fetchTasks } from "../redux/slices/taskSlice.js";
import { useDispatch } from "react-redux";

export const useTasks=(projectId,workspaceId)=>{
    const dispatch=useDispatch()
    const [filters,setFilters]=useState({})

    const handleCreateTask=async(taskData)=>{
        try {
            if(!taskData.title?.trim()){
                throw new Error('Task title is required')
            }
            const resultAction=await dispatch(createTask({taskData}))
            if(createTask.fulfilled.match(resultAction)){
                dispatch(fetchTasks({projectId}))
                return resultAction.payload
            } 
            if(resultAction.error){
                throw new Error(resultAction.error.message)
            }
            throw new Error(resultAction.error.message || 'Failed to create task')
        } catch (error) {
            console.error('Task creation error:',error)
            throw error;
        }
    }

    const handleBulkUpdate=async(tasks)=>{
        try {
            const resultAction=await dispatch(bulkUpdateTasks({tasks}))
            if(bulkUpdateTasks.fulfilled.match(resultAction)){

                return resultAction.payload
            }
        } catch (error) {
            console.error('Task update error:',error)
            throw error;
            
        }
    }

    const handleDeleteTask=async(taskId)=>{
        try {
            const resultAction=await dispatch(deleteTask({projectId,taskId}))
            if(deleteTask.fulfilled.match(resultAction)){
                return resultAction.payload
            }
            throw new Error('Failed to delete task')
        } catch (error) {
            console.error('Task deletion error:',error)
            throw error;
        }
    }

    const refreshTasks=()=>{
        dispatch(fetchTasks({projectId,filters}))
    }

    useEffect(()=>{
        refreshTasks()
    },[projectId,filters])

    return {
        createTask:handleCreateTask,
        updateTask:handleBulkUpdate,
        deleteTask:handleDeleteTask,
        setFilters,
        refreshTasks
    }
}