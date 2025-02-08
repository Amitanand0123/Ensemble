import React,{useState} from 'react'
import {useTasks} from '../../hooks/useTasks.js'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';


const TaskBoard=()=>{
    const {tasks,updateTask,isLoading}=useTasks(projectId)
    const [showCreateModal,setShowCreateModal]=useState(false)

    const columns={
        todo:tasks.filter(task=>tasks.status==='todo'),
        inProgress:tasks.filter(task=>tasks.status==='inProgress'),
        completed:tasks.filter(task=>tasks.status==='completed')
    }

    const onDragEnd=async(result)=>{
        const {source,destination,draggableId}=result
        if(!destination) return

        if(destination.droppableId===source.droppableId && destination.index===source.index) return

        const task=tasks.find(t=>t._id===draggableId)
        if(task){
            await updateTask(task._id,{
                ...task,
                status:destination.droppableId
            })
        }
    }

    if(isLoading) return <div>Loading tasks...</div>

    return (
        <div>
            <div>
                <Button onClick={()=>setShowCreateModal(true)}>
                    <PlusCircle />
                    Add task
                </Button>
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
                <div>
                    {Object.entries(columns).map(([columnId,columnTasks])=>(
                        <div key={columnId} className=''>
                            <h3>
                                {columnId==='inProgress'?'In Progress':columnId}
                            </h3>
                            <Droppable droppableId={columnId}>
                                {(provided)=>(
                                    <div {...provided.droppableProps} ref={provided.innerRef}>
                                        {columnTasks.map((Task,index)=>(
                                            <Draggable key={task._id} draggableId={task._id} index={index} >
                                                {(provided)=>(
                                                    <Card ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.draggableProps} className="bg-white"
                                                    >
                                                        <CardContent>
                                                            <h4 className='font-medium'>{task.title}</h4>
                                                            <p className='text-sm text-gray-600 mt-2'>{task.description}</p>
                                                            {task.assignee && (
                                                                <div className='mt-2 text-sm text-gray-500'>
                                                                    Assigned to:{task.assignee.name}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
            {showCreateModal && (
                <CreateTask projectId={projectId} onClose={()=>setShowCreateModal(false)} />
            )}
        </div>
    )
}

export default TaskBoard;