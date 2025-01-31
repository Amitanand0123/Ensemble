import React from "react";
import { useSelector } from "react-redux";

const ChatHeader=({chatType,targetId})=>{
    const users=useSelector(state=>state.users.users)
    const projects=useSelector(state=>state.projects.projects)

    const getTitle=()=>{
        if(chatType==='personal'){
            const user=users[targetId]
            return user?user.name:'Loading...'
        }
        else{
            const project=projects[targetId]
            return project?project.name:'Loading...'
        }
    }

    return (
        <div>
            <div>
                <div>
                    {chatType==='personal'?(<div>{getTitle().chatAt(0)}</div>):(
                        <div>
                            P
                        </div>
                    )}
                    <div>
                        <h2>{getTitle()}</h2>
                        <p>
                            {chatType==='personal'?'Personal Chat':'Project Chat'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default ChatHeader