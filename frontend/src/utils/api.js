import axios from 'axios'
import { forgotPassword, resetPassword } from '../redux/slices/authSlice'

const api=axios.create({
    baseURL:process.env.REACT_APP_API_URL,
    headers:{
        'Content-Type':'application/json',
    }
})

api.interceptors.request.use(
    (config)=>{
        const token=localStorage.getItem('token')
        if(token){
            config.headers.Authorization=`Bearer ${token}`
        }
        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response)=>response,
    (error)=>{
        if(error.response?.status===401){
            localStorage.removeItem('token')
            window.location.href='/login'
        }
    }
)

export const endpoints={
    auth:{
        login:(data)=>api.post('/auth/login',data),
        register:(data)=>api.post('/auth/register',data),
        forgotPassword:(data)=>api.post('/auth/forgot-password',data),
        resetPassword:(data)=>api.post('/auth/reset-password',data),
        updateProfile:(data)=>api.post('/auth/profile',data),
    },
    workspaces:{
        getAll:()=>api.get('/workspaces'),
        getOne:(id)=>api.get(`/workspaces/${id}`),
        create:(data)=>api.post('/workspaces',data),
        update:(id,data)=>api.put(`/workspaces/${id}`,data),
        delete:(id)=>api.delete(`/workspaces/${id}`),
    },
    projects:{
        getAll:(workspaceId)=>api.get(`/workspaces/${workspaceId}/projects`),
        getOne:(id)=>api.get(`/projects/${id}`),
        create:(workspaceId,data)=>api.post(`/workspaces/${workspaceId}/projects`,data),
        update:(id,data)=>api.patch(`/projects/${id}`,data),
        delete:(id)=>api.delete(`/projects/${id}`)
    },
    tasks:{
        getAll:(projectId)=>api.get(`/projects/${projectId}/tasks`),
        getOne:(id)=>api.get(`/tasks/${id}`),
        create:(projectId,data)=>api.post(`/projects/${projectId}/tasks`,data),
        update:(id,data)=>api.patch(`/tasks/${id}`,data),
        delete:(id)=>api.delete(`/tasks/${id}`)
    }
}

export default api;