import React from 'react';
import { useTask } from '../contexts/TaskContext';
import { AlertTriangle, X, GitMerge, Save, FileX } from 'lucide-react';

const ConflictModal = ({ conflict }) => {
  const { resolveConflict, clearConflict } = useTask();

  const handleResolve = async (resolution) => {
    await resolveConflict(conflict.taskId, resolution, conflict);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      clearConflict();
    }
  };

  if (!conflict) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content conflict-modal">
        <div className="modal-header">
          <div className="conflict-header">
            <AlertTriangle size={24} className="conflict-icon" />
            <h2>Conflict Detected</h2>
          </div>
          <button onClick={clearConflict} className="modal-close">
            <X size={24} />
          </button>
        </div>

        <div className="conflict-content">
          <p className="conflict-message">
            Another user has modified this task while you were editing it. 
            Please choose how to resolve this conflict:
          </p>

          <div className="conflict-versions">
            <div className="conflict-version">
              <h4>Your Version</h4>
              <div className="version-details">
                <p><strong>Title:</strong> {conflict.yourVersion?.title || 'N/A'}</p>
                <p><strong>Description:</strong> {conflict.yourVersion?.description || 'N/A'}</p>
                <p><strong>Priority:</strong> {conflict.yourVersion?.priority || 'N/A'}</p>
                <p><strong>Assigned To:</strong> {conflict.yourVersion?.assignedTo || 'Unassigned'}</p>
                <p><strong>Status:</strong> {conflict.yourVersion?.status || 'N/A'}</p>
              </div>
            </div>

            <div className="conflict-version">
              <h4>Current Version (Their Changes)</h4>
              <div className="version-details">
                <p><strong>Title:</strong> {conflict.theirVersion?.title || 'N/A'}</p>
                <p><strong>Description:</strong> {conflict.theirVersion?.description || 'N/A'}</p>
                <p><strong>Priority:</strong> {conflict.theirVersion?.priority || 'N/A'}</p>
                <p><strong>Assigned To:</strong> {conflict.theirVersion?.assignedTo || 'Unassigned'}</p>
                <p><strong>Status:</strong> {conflict.theirVersion?.status || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="conflict-actions">
            <button
              onClick={() => handleResolve('merge')}
              className="button primary"
              title="Merge both versions (your changes take priority)"
            >
              <GitMerge size={16} />
              Merge Changes
            </button>
            <button
              onClick={() => handleResolve('overwrite')}
              className="button warning"
              title="Use only your version"
            >
              <Save size={16} />
              Use My Version
            </button>
            <button
              onClick={() => handleResolve('keep')}
              className="button secondary"
              title="Keep the current version"
            >
              <FileX size={16} />
              Keep Current Version
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;