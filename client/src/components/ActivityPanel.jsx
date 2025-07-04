import React from 'react';
import { useTask } from '../contexts/TaskContext';
import { X, Clock, User, FileText, Trash2, Edit, Move } from 'lucide-react';

const ActivityPanel = ({ onClose }) => {
  const { logs } = useTask();

  const getActivityIcon = (actionType) => {
    switch (actionType) {
      case 'created':
        return <FileText size={16} />;
      case 'updated':
        return <Edit size={16} />;
      case 'deleted':
        return <Trash2 size={16} />;
      case 'moved':
        return <Move size={16} />;
      case 'assigned':
        return <User size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getActivityColor = (actionType) => {
    switch (actionType) {
      case 'created':
        return 'var(--color-success)';
      case 'updated':
        return 'var(--color-info)';
      case 'deleted':
        return 'var(--color-error)';
      case 'moved':
        return 'var(--color-warning)';
      case 'assigned':
        return 'var(--color-primary)';
      default:
        return 'var(--color-gray-500)';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="activity-panel">
      <div className="activity-header">
        <h3>Recent Activity</h3>
        <button onClick={onClose} className="panel-close mobile-only">
          <X size={20} />
        </button>
      </div>

      <div className="activity-content">
        {logs.length === 0 ? (
          <div className="empty-activity">
            <Clock size={48} />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="activity-list">
            {logs.map(log => (
              <div key={log.id} className="activity-item">
                <div 
                  className="activity-icon"
                  style={{ color: getActivityColor(log.actionType) }}
                >
                  {getActivityIcon(log.actionType)}
                </div>
                <div className="activity-details">
                  <div className="activity-text">
                    <strong>{log.username}</strong> {log.actionType} task{' '}
                    <em>"{log.taskTitle}"</em>
                    {log.additionalInfo && (
                      <span className="activity-info"> - {log.additionalInfo}</span>
                    )}
                  </div>
                  <div className="activity-time">
                    {formatTime(log.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPanel;