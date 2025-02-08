import {useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createProject, fetchProjects, setCurrentProject } from '../redux/slices/projectSlice'

export const useProjects=(workspaceId)=>{
    const dispatch=useDispatch()
    const {projects,currentProject,isLoading,error}=useSelector((state)=>state.projects)

    useEffect(()=>{
        if(workspaceId){
            dispatch(fetchProjects(workspaceId))
        }
    },[dispatch,workspaceId])

    const createNewProject=async(projectData)=>{
        try {
            await dispatch(createProject(projectData)).unwrap()
            return true
        } catch (error) {
            console.error('Failed to create project:',error)
            return false
        }
    }

    const selectProject=(project)=>{
        dispatch(setCurrentProject(project))
    }

    return {projects,currentProject,isLoading,error,createNewProject,selectProject}
}