import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Activity, LogOut, Wifi, WifiOff, Target } from 'lucide-react';

const Header = ({ user, connected, onCreateTask, onToggleActivity, showActivityPanel }) => {
  const { logout } = useAuth();

  // Safe defaults
  const userInitial = user?.username?.charAt(0)?.toUpperCase() || 'U';
  const username = user?.username || 'Unknown';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
              <div className="logo-icon">
                <Target size={24} />
              </div>
              <span className="logo-text">CollabBoard</span>
            </div>
          <div className="connection-status">
            {connected ? (
              <div className="connected">
                <Wifi size={16} />
                <span>Connected</span>
              </div>
            ) : (
              <div className="disconnected">
                <WifiOff size={16} />
                <span>Disconnected</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="header-right">
          <button
            onClick={onCreateTask}
            className="header-button primary"
          >
            <Plus size={20} />
            <span>Add Task</span>
          </button>
          
          <button
            onClick={onToggleActivity}
            className={`header-button ${showActivityPanel ? 'active' : ''}`}
          >
            <Activity size={20} />
            <span className="desktop-only">Activity</span>
          </button>
          
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {userInitial}
              </div>
              <span className="user-name desktop-only">{username}</span>
            </div>
            <button
              onClick={logout}
              className="header-button logout"
            >
              <LogOut size={20} />
              <span className="desktop-only">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
