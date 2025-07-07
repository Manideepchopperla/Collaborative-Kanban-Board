import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Header from './Header';
import KanbanBoard from './KanbanBoard';
import ActivityPanel from './ActivityPanel';
import TaskModal from './TaskModal';
import ConflictModal from './ConflictModal';
import { useTask } from '../contexts/TaskContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { connected } = useSocket();
  const { conflict } = useTask();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showActivityPanel, setShowActivityPanel] = useState(true);

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
  };

  return (
    <div className="dashboard">
      <Header
        user={user}
        connected={connected}
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

      { showTaskModal && (
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

export default Dashboard;