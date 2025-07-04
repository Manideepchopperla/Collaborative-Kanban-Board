import React from 'react';
import { useTask } from '../contexts/TaskContext';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = ({ onEditTask }) => {
  const { tasks, loading } = useTask();

  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' },
    { id: 'inprogress', title: 'In Progress', status: 'inprogress' },
    { id: 'done', title: 'Done', status: 'done' }
  ];

  const getTasksForColumn = (status) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => task.status === status);
  };


  if (loading) {
    return (
      <div className="kanban-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="kanban-board">
      {columns.map(column => (
        <KanbanColumn
          key={column.id}
          column={column}
          tasks={getTasksForColumn(column.status)}
          onEditTask={onEditTask}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;