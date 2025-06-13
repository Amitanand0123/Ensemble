import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { createTask, deleteTask, fetchTasks, updateTask } from "../redux/slices/taskSlice.js";

export const useTasks=(projectId)=>{
    const dispatch = useDispatch()

    const refreshTasks = useCallback((filters = {}) => {
        if (projectId) {
            dispatch(fetchTasks({ projectId, filters }));
        }
    }, [dispatch, projectId]);

    const handleCreateTask=async(taskData)=>{
        try {
            const resultAction = await dispatch(createTask({ formData: taskData }));
            if (createTask.fulfilled.match(resultAction)) {
                return resultAction.payload;
            }
            throw new Error(resultAction.payload || 'Failed to create task');
        } catch (error) {
            console.error('Task creation error in hook:',error)
            throw error;
        }
    }

    const handleUpdateTask = async (taskId, updates) => {
        try {
            const resultAction = await dispatch(updateTask({ taskId, updates }));
            if (updateTask.fulfilled.match(resultAction)) {
                return resultAction.payload;
            }
            throw new Error(resultAction.payload || 'Failed to update task');
        } catch (error) {
            console.error('Task update error in hook:', error);
            throw error;
        }
    };

    const handleDeleteTask=async(taskId)=>{
        try {
            const resultAction = await dispatch(deleteTask({ taskId }));
            if (deleteTask.fulfilled.match(resultAction)) {
                return resultAction.payload;
            }
            throw new Error(resultAction.payload || 'Failed to delete task');
        } catch (error) {
            console.error('Task deletion error in hook:',error)
            throw error;
        }
    }

    return {
        createTask: handleCreateTask,
        updateTask: handleUpdateTask,
        deleteTask: handleDeleteTask,
        refreshTasks
    }
}