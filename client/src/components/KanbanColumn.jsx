import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import TaskCard from './TaskCard';
import { toast } from 'react-toastify';
import { MoreVertical } from 'lucide-react';

const KanbanColumn = ({ column, tasks, onEditTask }) => {
  const [dragOver, setDragOver] = useState(false);
  const { moveTask } = useTask();


  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      try {
      const status = column.status;     
      const updatedTask = await moveTask(taskId, column.status);
      if (updatedTask) {
        toast.success(`Moved task to "${column.title}"`);
      } else {
        toast.warning('Unable to move task');
      }
    } catch (error) {
      toast.error('Error moving task');
    }
    }
  };

  const getColumnColor = (status) => {
    switch (status) {
      case 'todo':
        return 'var(--color-todo)';
      case 'inprogress':
        return 'var(--color-inprogress)';
      case 'done':
        return 'var(--color-done)';
      default:
        return 'var(--color-gray-500)';
    }
  };

  return (
    <div
      className={`kanban-column ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <div className="column-title">
          <div
            className="column-indicator"
            style={{ backgroundColor: getColumnColor(column.status) }}
          ></div>
          <h3>{column.title}</h3>
          <span className="task-count">{tasks.length}</span>
        </div>
        {/* <button className="column-menu">
          <MoreVertical size={16} />
        </button> */}
      </div>
      
      <div className="column-content">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="empty-column">
            <p>No tasks in {column.title.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;