import React, { useState } from 'react';
import { useTask } from '../contexts/TaskContext';
import { Edit3, Trash2, User, AlertCircle, Users } from 'lucide-react';

const TaskCard = ({ task, onEdit }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { deleteTask, smartAssign } = useTask();

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleSmartAssign = async (e) => {
    e.stopPropagation();
    await smartAssign(task.id);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'var(--color-priority-high)';
      case 'medium':
        return 'var(--color-priority-medium)';
      case 'low':
        return 'var(--color-priority-low)';
      default:
        return 'var(--color-gray-400)';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle size={14} />;
      case 'medium':
        return <AlertCircle size={14} />;
      case 'low':
        return <AlertCircle size={14} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="task-header">
        <div className="task-priority" style={{ color: getPriorityColor(task.priority) }}>
          {getPriorityIcon(task.priority)}
          <span>{task.priority}</span>
        </div>
        <div className="task-actions">
          <button
            onClick={handleEdit}
            className="task-action-button"
            title="Edit task"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="task-action-button delete"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="task-content">
        <h4 className="task-title">{task.title}</h4>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>
      
      <div className="task-footer">
        <div className="task-assignee">
          {task.assignedTo ? (
            <div className="assignee-info">
              <User size={14} />
              <span>{task.assignedTo}</span>
            </div>
          ) : (
            <button
              onClick={handleSmartAssign}
              className="smart-assign-button"
              title="Smart assign to user with least tasks"
            >
              <Users size={14} />
              <span>Auto-assign</span>
            </button>
          )}
        </div>
        
        <div className="task-meta">
          <span className="task-date">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;