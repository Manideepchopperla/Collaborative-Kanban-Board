// 部屋 MODIFIED: This file is now for creating and joining rooms.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { PlusSquare, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="dashboard-create">
      <header className="header">
        <div className="header-content">
            <h1>Welcome, {user.username}!</h1>
            <button onClick={logout} className="button secondary">Logout</button>
        </div>
      </header>
      <div className="create-board-container">
        <h2>Get Started</h2>
        <p>Create a new collaborative board and invite your team.</p>
        <button onClick={createNewBoard} disabled={loading} className="button primary create-button">
          <PlusSquare size={20} />
          {loading ? 'Creating...' : 'Create New Board'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;