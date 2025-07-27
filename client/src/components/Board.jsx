
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useTask } from '../contexts/TaskContext';
import Header from './Header';
import KanbanBoard from './KanbanBoard';
import ActivityPanel from './ActivityPanel';
import TaskModal from './TaskModal';
import ConflictModal from './ConflictModal';

const Board = () => {
  const { user } = useAuth();
  const { connected, members } = useSocket();
  const { conflict, clearConflict } = useTask();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showActivityPanel, setShowActivityPanel] = useState(true);

  const { roomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) {
      navigate('/dashboard');
    }
  }, [roomId, navigate]);


  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    if (conflict) {
      clearConflict();
    }
  };

  return (
    <div className="dashboard">
      <Header
        user={user}
        connected={connected}
        members={members}
        onCreateTask={handleCreateTask}
        onToggleActivity={() => setShowActivityPanel(!showActivityPanel)}
        showActivityPanel={showActivityPanel}
      />
      
      <div className="dashboard-content">
        <div className={`main-content ${showActivityPanel ? 'with-activity' : 'full-width'}`}>
          <KanbanBoard onEditTask={handleEditTask} />
        </div>
        
        {showActivityPanel && (
          <ActivityPanel onClose={() => setShowActivityPanel(false)} />
        )}
      </div>

      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseModal}
        />
      )}

      {conflict && (
        <ConflictModal conflict={conflict} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Board;