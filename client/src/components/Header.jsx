import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Activity, LogOut, Wifi, WifiOff, Target, Users, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';


const Header = ({ user, connected, members, onCreateTask, onToggleActivity, showActivityPanel }) => {
  const { logout } = useAuth();
  const [showMembers, setShowMembers] = useState(false);

  const userInitial = user?.username?.charAt(0)?.toUpperCase() || 'U';
  const username = user?.username || 'Unknown';

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Board link copied to clipboard!');
  };


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
          <button onClick={handleShare} className="header-button">
            <Share2 size={20} />
            <span className="desktop-only">Share</span>
          </button>

          <button
            onClick={onCreateTask}
            className="header-button primary"
          >
            <Plus size={20} />
            <span className="desktop-only">Add Task</span>
          </button>
          
          <button
            onClick={onToggleActivity}
            className={`header-button ${showActivityPanel ? 'active' : ''}`}
          >
            <Activity size={20} />
            <span className="desktop-only">Activity</span>
          </button>

          <div className="members-menu">
            <button
                onClick={() => setShowMembers(!showMembers)}
                className="header-button"
            >
                <Users size={20} />
                <span>{members.length}</span>
            </button>
            {showMembers && (
                <div className="members-dropdown">
                    <h4>Active Members</h4>
                    <ul>
                        {members.map((member) => (
                            <li key={member.id}>{member.username}</li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
          
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