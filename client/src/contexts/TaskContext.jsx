import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        loading: false
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload]
      };
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
      return {
        ...state,
        logs: action.payload
      };
    case 'ADD_LOG':
      return {
        ...state,
        logs: [action.payload, ...state.logs.slice(0, 19)]
      };
    case 'SET_CONFLICT':
      return {
        ...state,
        conflict: action.payload
      };
    case 'CLEAR_CONFLICT':
      return {
        ...state,
        conflict: null
      };
    default:
      return state;
  }
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
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

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchLogs();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.on('task_created', (task) => {
        dispatch({ type: 'ADD_TASK', payload: task });
      });

      socket.on('task_updated', (task) => {
        dispatch({ type: 'UPDATE_TASK', payload: task });
      });

      socket.on('task_deleted', (taskId) => {
        dispatch({ type: 'DELETE_TASK', payload: taskId });
      });

      socket.on('task_moved', (task) => {
        dispatch({ type: 'UPDATE_TASK', payload: task });
      });

      socket.on('activity_log', (log) => {
        dispatch({ type: 'ADD_LOG', payload: log });
      });

      socket.on('conflict_detected', (conflictData) => {
        dispatch({ type: 'SET_CONFLICT', payload: conflictData });
      });

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

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const tasks = await response.json();
      dispatch({ type: 'SET_TASKS', payload:Array.isArray(tasks) ? tasks : [] });
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs/recent', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const logs = await response.json();
      dispatch({ type: 'SET_LOGS', payload: Array.isArray(logs) ? logs : []  });
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(taskData)
      });
      const newTask = await response.json();
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      // Get current task to include version for conflict detection
      const currentTask = state.tasks.find(task => task.id === taskId);
      const updateData = {
        ...updates,
        lastUpdated: currentTask?.lastUpdated,
        version: currentTask?.version
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.status === 409) {
        // Conflict detected - the server will emit conflict_detected event
        const conflictData = await response.json();
        return null;
      }

      const updatedTask = await response.json();
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/drag-drop/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const updatedTask = await response.json();
      return updatedTask;
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  const smartAssign = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/smart-assign/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const updatedTask = await response.json();
        return updatedTask;
      } else {
        console.error('Error smart assigning task');
      }
    } catch (error) {
      console.error('Error smart assigning task:', error);
    }
  };

  const resolveConflict = async (taskId, resolution, data) => {
    try {
      const response = await fetch(`/api/tasks/resolve-conflict/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ resolution, data })
      });
      const resolvedTask = await response.json();
      dispatch({ type: 'CLEAR_CONFLICT' });
      return resolvedTask;
    } catch (error) {
      console.error('Error resolving conflict:', error);
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