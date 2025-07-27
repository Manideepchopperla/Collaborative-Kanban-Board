import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { PlusSquare, Target } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const createNewBoard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create board');
      }

      const newBoard = await response.json();
      toast.success('New board created!');
      navigate(`/board/${newBoard._id}`);
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('Could not create a new board.');
      setLoading(false);
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();

    const trimmed = joinCode.trim();

    if (!trimmed) {
      toast.error('Please enter a valid board link or ID.');
      return;
    }

    let boardId = trimmed;

    try {
      const url = new URL(trimmed);
      const segments = url.pathname.split('/');
      boardId = segments[segments.length - 1] || '';
    } catch (err) {
      // Not a full URL, use as-is
    }

    if (!boardId.match(/^[a-f\d]{24}$/i)) {
      toast.error('Invalid board ID.');
      return;
    }

    navigate(`/board/${boardId}`);
    setShowJoinModal(false);
    setJoinCode('');
  };

  return (
    <div className="dashboard-create">
      <header className="dashboard-header">
        <div className="dashboard-header-container">
          <div className="dashboard-logo">
            <Target size={24} />
            <span className="dashboard-logo-text">CollabBoard</span>
          </div>

          <div className="dashboard-welcome">
            <h1>Welcome, {user.username}!</h1>
          </div>

          <div className="dashboard-logout">
            <button onClick={logout} className="dashboard-logout-button">Logout</button>
          </div>
        </div>
      </header>


      <div className="create-board-container">
        <h2>Get Started</h2>
        <p>Create a new collaborative board or join an existing one.</p>
        <div className="button-group">
          <button onClick={createNewBoard} disabled={loading} className="button primary create-button">
            <PlusSquare size={20} />
            {loading ? 'Creating...' : 'Create New Board'}
          </button>
          <button onClick={() => setShowJoinModal(true)} className="button secondary">
            Join Room
          </button>
        </div>
      </div>

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Join a Board</h3>
            <form onSubmit={handleJoinSubmit}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter Board ID or URL"
                required
              />
              <div className="button-group">
                <button type="submit" className="button primary">Join</button>
                <button type="button" className="button secondary" onClick={() => setShowJoinModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
