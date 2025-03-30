import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js"
import workspaceReducer from "./slices/workspaceSlice.js"
import projectReducer from "./slices/projectSlice.js"
import taskReducer from "./slices/taskSlice.js"
import chatReducer from "./slices/chatSlice.js"
import notificationReducer from "./slices/notificationSlice.js"
import usersReducer from "./slices/usersSlice.js"

const store=configureStore({
    reducer:{
        auth:authReducer,
        workspaces:workspaceReducer,
        projects:projectReducer,
        task:taskReducer,
        chat:chatReducer,
        notifications:notificationReducer,
        users:usersReducer
    },
    middleware:(getDefaultMiddleware)=>
        getDefaultMiddleware({
            serializableCheck:{
                ignoredActions:['socket/connect','socket/disconnected'],
                ignoredActionPaths:['payload.file','payload.socket'],
                ignoredPaths:['socket.instance']
            }
        })
})

export default store;