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
    devTools: import.meta.env.NODE_ENV !== 'production',
    middleware:(getDefaultMiddleware)=>
        getDefaultMiddleware({
            serializableCheck:{
                ignoredActionPaths: ['meta.arg.formData', 'payload.formData', 'payload.file', 'payload.socket'],
                ignoredActions: [
                    'socket/connect', 'socket/disconnected',
                    'files/uploadWorkspace/pending', 'files/uploadProject/pending',
                    'files/uploadWorkspace/rejected', 'files/uploadProject/rejected',
                    'tasks/create/pending', 'tasks/create/rejected',
                    'tasks/addAttachments/pending', 'tasks/addAttachments/rejected',
                    'users/updateAvatar/pending', 'users/updateAvatar/rejected'
                ],
                ignoredPaths:['socket.instance', 'users.selectedUserProfile.file']
            }
        })
})

export default store;