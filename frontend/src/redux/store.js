// --- START OF FILE frontend/src/redux/store.js ---

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js"
import workspaceReducer from "./slices/workspaceSlice.js"
import projectReducer from "./slices/projectSlice.js"
import taskReducer from "./slices/taskSlice.js"
import chatReducer from "./slices/chatSlice.js"
import notificationReducer from "./slices/notificationSlice.js"
import usersReducer from "./slices/usersSlice.js" // Import the new reducer
import fileReducer from "./slices/fileSlice.js"

const store=configureStore({
    reducer:{
        auth:authReducer,
        workspaces:workspaceReducer,
        projects:projectReducer,
        task:taskReducer,
        chat:chatReducer,
        notifications:notificationReducer,
        users:usersReducer, // Add the users reducer
        files:fileReducer
    },
    middleware:(getDefaultMiddleware)=>
        getDefaultMiddleware({
            serializableCheck:{
                 // Add specific paths for FormData if necessary
                 ignoredActionPaths: ['meta.arg.formData', 'payload.formData', 'payload.file', 'payload.socket'],
                ignoredActions: [
                    'socket/connect', 'socket/disconnected',
                    'files/uploadWorkspace/pending', 'files/uploadProject/pending',
                    'files/uploadWorkspace/rejected', 'files/uploadProject/rejected',
                    'tasks/create/pending', 'tasks/create/rejected', // If tasks also upload files
                    'tasks/addAttachments/pending', 'tasks/addAttachments/rejected', // If tasks also upload files
                    'users/updateAvatar/pending', 'users/updateAvatar/rejected' // Add avatar upload actions
                ],
                ignoredPaths:['socket.instance', 'users.selectedUserProfile.file'] // Add paths potentially holding non-serializable data
            }
        })
})

export default store;
// --- END OF FILE frontend/src/redux/store.js ---