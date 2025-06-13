import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWorkspaces, createWorkspace, setCurrentWorkspace } from "../redux/slices/workspaceSlice.js";

export const useWorkspaces=()=>{
    const dispatch=useDispatch()
    const {workspaces, workspaceDetail, isLoading, error}=useSelector((state)=>state.workspaces)

    useEffect(()=>{
        dispatch(fetchWorkspaces())
    },[dispatch])

    const createNewWorkspace=async(workspaceData)=>{
        try {
            await dispatch(createWorkspace(workspaceData)).unwrap();
            return true;
        } catch (err) {
            console.error('Failed to create workspace:', err);
            throw err;
        }
    }

    const selectWorkspace=(workspace)=>{
        dispatch(setCurrentWorkspace(workspace))
    }

    return {workspaces, currentWorkspace: workspaceDetail, isLoading, error, createNewWorkspace, selectWorkspace}
}