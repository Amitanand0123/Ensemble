import React from 'react'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'


const TaskFilter=({onFilterChange,currentFilters})=>{
    
    return (
        <div>
            <Select value={currentFilters.status} onValueChange={(value)=>onFilterChange('status',value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="inProgress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
            </Select>
            <Select value={currentFilters.priority} onValueChange={(value)=>onFilterChange('priority',value)}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" onClick={()=>onFilterChange('reset')} className=''>
                Reset Filters
            </Button>
        </div>
    )
}

export default TaskFilter;