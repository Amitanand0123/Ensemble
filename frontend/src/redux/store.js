import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js"
import workspaceReducer from "./slices/workspaceSlice.js"
import projectReducer from "./slices/projectSlice.js"
import taskReducer from "./slices/taskSlice.js"
import chatReducer from "./slices/chatSlice.js"
import notificationReducer from "./slices/notificationSlice.js"
import usersReducer from "./slices/usersSlice.js"
import fileReducer from "./slices/fileSlice.js"

const store=configureStore({
    reducer:{
        auth:authReducer,
        workspaces:workspaceReducer,
        projects:projectReducer,
        task:taskReducer,
        chat:chatReducer,
        notifications:notificationReducer,
        users:usersReducer,
        files:fileReducer
    },
    middleware:(getDefaultMiddleware)=>
        getDefaultMiddleware({
            serializableCheck:{
                ignoredActions: [
                    'socket/connect', 'socket/disconnected',
                    'files/uploadWorkspace/pending', 'files/uploadProject/pending',
                    'files/uploadWorkspace/rejected', 'files/uploadProject/rejected',
                    'tasks/create/pending', 'tasks/create/rejected', // If tasks also upload files
                    'tasks/addAttachments/pending', 'tasks/addAttachments/rejected' // If tasks also upload files
                ],
                ignoredActionPaths:['payload.file','payload.socket','meta.arg.formData'],
                ignoredPaths:['socket.instance']
            }
        })
})

export default store;