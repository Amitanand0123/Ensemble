import React from 'react'
import { Card } from "../ui/card"; 


const TaskCard=React.forwardRef(({task,onStatusChange},ref)=>{
    const priorityColors={
        high:'bg-red-100 text-red-800',
        medium:'bg-yellow-100 text-yellow-800',
        low:'bg-green-100 text-green-800'
    }

    return (
        <Card ref={ref} className= >
            <CardContent>
                <div>
                    <h3>
                        {task.title}
                    </h3>
                    <span>
                        {task.priority}
                    </span>
                </div>
                <p>
                    {task.description}
                </p>
                <div>
                    <div>
                        {task.assignee && (
                            <div>
                                <span>
                                    {task.assignee.name[0]}
                                </span>
                                <span>
                                    {task.assignee.name}
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
})

export default TaskCard