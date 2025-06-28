import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js"
import workspaceReducer from "./slices/workspaceSlice.js"
import projectReducer from "./slices/projectSlice.js"
import taskReducer from "./slices/taskSlice.js"
import chatReducer from "./slices/chatSlice.js"
import notificationReducer from "./slices/notificationSlice.js"
import usersReducer from "./slices/usersSlice.js"
import fileReducer from "./slices/fileSlice.js"

const store=configureStore({ //  function used to create a Redux store using modern Redux Toolkit conventions.
    reducer:{
        auth:authReducer, // E.g., state.auth will be managed by authReducer, state.projects by projectReducer, etc.
        workspaces:workspaceReducer,
        projects:projectReducer,
        task:taskReducer,
        chat:chatReducer,
        notifications:notificationReducer,
        users:usersReducer,
        files:fileReducer
    },
    devTools: import.meta.env.NODE_ENV !== 'production', // Enables Redux DevTools only in development mode.
    middleware:(getDefaultMiddleware)=> // Redux Toolkit comes with default middlewares.
        getDefaultMiddleware({
            serializableCheck:{ // This customizes one of them: the serializable check, which ensures that Redux state/actions are serializable (i.e., no File, FormData, or Socket objects).
                ignoredActionPaths: ['meta.arg.formData', 'payload.formData', 'payload.file', 'payload.socket'], // Tells Redux not to complain if these paths contain non-serializable data (like FormData, File, or Socket).
                ignoredActions: [
                    'socket/connect', 'socket/disconnected', // Specifies actions that may carry non-serializable payloads and should not trigger warnings.
                    'files/uploadWorkspace/pending', 'files/uploadProject/pending',
                    'files/uploadWorkspace/rejected', 'files/uploadProject/rejected',
                    'tasks/create/pending', 'tasks/create/rejected',
                    'tasks/addAttachments/pending', 'tasks/addAttachments/rejected',
                    'users/updateAvatar/pending', 'users/updateAvatar/rejected'
                ],
                ignoredPaths:['socket.instance', 'users.selectedUserProfile.file'] // These are paths in your Redux state that might hold non-serializable data (like a file or a socket instance).
            }
        })
})

export default store;