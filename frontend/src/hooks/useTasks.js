import { useEffect,useState } from "react";
import axios from "axios";
import { fetchTasks } from "../redux/slices/taskSlice";

export const useTasks=(projectId)=>{
    const [tasks,setTasks]=useState([])
    const [isLoading,setIsLoading]=useState(true)
    const [error,setError]=useState(null)

    useEffect(()=>{
        if(projectId){
            fetchTasks()
        }
    },[projectId])

    const fetchTasks=async()=>{
        setIsLoading(true)
        try {
            const response=await axios.get(`/api/projects/${projectId}/tasks`)
            setTasks(response.data.tasks)
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to fetch tasks')
        } finally {
            setIsLoading(false)
        }
    }

    const createTask=async(taskData)=>{
        try {
            const response=await axios.post(`/api/projects/${projectId}/tasks`,taskData)
            setTasks([...tasks,response.data.task])
            return response.data.task
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create task')
        }
    }

    const updateTask=async(taskId,taskData)=>{
        try {
            const response=await axios.post(`/api/projects/${projectId}/tasks/${taskId}`,taskData)
            setTasks(tasks.map(task=> task._id?response.data.task:task))
            return response.data.task
        } catch (error) {
            throw new Error(error.reponse?.data?.message||'Failed to update task')
        }
    }

    const deleteTask=async(taskId)=>{
        try {
            await axios.delete(`/api/projects/${projectId}/tasks/${taskId}`)
            setTasks(tasks.filter(task=>task._id!==taskId))
        } catch (error) {
            throw new Error(error.response?.data?.message||'Failed to delete task')
        }
    }

    return {tasks,isLoading,error,createTask,updateTask,deleteTask,refreshTasks:fetchTasks}
}