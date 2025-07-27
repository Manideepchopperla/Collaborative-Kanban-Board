import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      };
    case 'SET_LOGS':
      return { ...state, logs: action.payload };
    case 'ADD_LOG':
      return { ...state, logs: [action.payload, ...state.logs.slice(0, 19)] };
    case 'SET_CONFLICT':
      return { ...state, conflict: action.payload };
    case 'CLEAR_CONFLICT':
      return { ...state, conflict: null };
    default:
      return state;
  }
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTask must be used within a TaskProvider');
  return context;
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    logs: [],
    conflict: null,
    loading: true
  });

  const { socket } = useSocket();
  const { user } = useAuth();
  const { roomId } = useParams();

  useEffect(() => {
    if (user && roomId) {
      fetchBoardData();
      fetchLogs();
    }
  }, [user, roomId]);

  useEffect(() => {
    if (socket) {
      socket.on('task_created', task => dispatch({ type: 'ADD_TASK', payload: task }));
      socket.on('task_updated', task => dispatch({ type: 'UPDATE_TASK', payload: task }));
      socket.on('task_deleted', taskId => dispatch({ type: 'DELETE_TASK', payload: taskId }));
      socket.on('task_moved', task => dispatch({ type: 'UPDATE_TASK', payload: task }));
      socket.on('activity_log', log => dispatch({ type: 'ADD_LOG', payload: log }));
      socket.on('conflict_detected', data => dispatch({ type: 'SET_CONFLICT', payload: data }));

      return () => {
        socket.off('task_created');
        socket.off('task_updated');
        socket.off('task_deleted');
        socket.off('task_moved');
        socket.off('activity_log');
        socket.off('conflict_detected');
      };
    }
  }, [socket]);

  const fetchBoardData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boards/${roomId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const board = await res.json();
      dispatch({ type: 'SET_TASKS', payload: Array.isArray(board.tasks) ? board.tasks : [] });
    } catch (err) {
      console.error('Error fetching board data:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/logs/${roomId}/recent`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const logs = await res.json();
      dispatch({ type: 'SET_LOGS', payload: Array.isArray(logs) ? logs : [] });
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const createTask = async (taskData) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...taskData, boardId: roomId })
      });
      return await res.json(); // Socket will update state
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (res.status === 409) {
        const conflict = await res.json();
        dispatch({ type: 'SET_CONFLICT', payload: conflict });
        throw new Error('Conflict detected');
      }

      if (!res.ok) throw new Error('Failed to update task');

      const updated = await res.json();
      dispatch({ type: 'UPDATE_TASK', payload: updated });
      return updated;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      // Socket handles state
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/drag-drop/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      return await res.json(); // Socket updates state
    } catch (err) {
      console.error('Error moving task:', err);
    }
  };

  const smartAssign = async (taskId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/smart-assign/${taskId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.error('Error smart assigning task:', err);
    }
  };

  const resolveConflict = async (taskId, resolution, data) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/tasks/resolve-conflict/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ resolution, data })
      });
      const resolved = await res.json();
      dispatch({ type: 'CLEAR_CONFLICT' });
      return resolved;
    } catch (err) {
      console.error('Error resolving conflict:', err);
    }
  };

  const value = {
    ...state,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    smartAssign,
    resolveConflict,
    clearConflict: () => dispatch({ type: 'CLEAR_CONFLICT' })
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
