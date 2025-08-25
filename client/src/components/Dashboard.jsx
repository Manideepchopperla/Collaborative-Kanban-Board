import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { PlusSquare, Target, Layout, ChevronDown, Users, Link2,X } from 'lucide-react';


const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [userRooms, setUserRooms] = useState([]);
  const [isRoomsDropdownOpen, setIsRoomsDropdownOpen] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const dropdownRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch user's rooms when component mounts
  // useEffect(() => {
  //   fetchUserRooms();
  // }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsRoomsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleRoomsDropdown = () => {
    setIsRoomsDropdownOpen(!isRoomsDropdownOpen);
  };

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
    <div className="dashboard-wrapper">
      {/* Header */}
<header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
          <Target size={20} className="text-white" />
        </div>
        <span className="text-lg font-semibold text-gray-900">CollabBoard</span>
      </div>

      {/* Safely derive user data */}
      {(() => {
        const username = user?.username ?? '';
        const initial = (username?.[0] || 'U').toUpperCase();
        const showLogout = Boolean(username);

        return (
          <>
            {/* Desktop User Section */}
            <div className="hidden md:flex items-center gap-6 pr-3">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">{initial}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {username || 'Guest'}
                </span>
              </div>

              {showLogout && (
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center justify-center h-9
                            pl-4 pr-4 sm:pl-5 sm:pr-5
                            ml-3 md:ml-4 mr-2
                            rounded-md bg-red-600 text-white text-sm font-medium shadow-sm
                            hover:bg-red-700 focus-visible:outline-none
                            focus-visible:ring-2 focus-visible:ring-red-500/50
                            transition-colors"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden relative">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(prev => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">{initial}</span>
                </div>
                {mobileMenuOpen ? (
                  <X size={16} className="text-gray-600" aria-hidden="true" />
                ) : (
                  <ChevronDown size={16} className="text-gray-600" aria-hidden="true" />
                )}
              </button>

              {/* Mobile Dropdown */}
              {mobileMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-white">{initial}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {username || 'Guest'}
                        </p>
                        <p className="text-xs text-gray-500">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                                    <div className="p-3">
                    {showLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 
                                   px-3.5 py-2.5 rounded-md text-sm font-medium 
                                   text-red-600 hover:bg-red-50 active:bg-red-100 
                                   focus:outline-none focus:ring-2 focus:ring-red-500/40 
                                   transition-colors"
                      >
                        Logout
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        );
      })()}
    </div>
  </div>
</header>




      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome back, <span className="highlight">{user.username}</span>!
            </h1>
            <p className="hero-subtitle">
              Create collaborative boards, manage projects, and work together in real-time
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="dashboard-actions">
          <div className="action-card create-card">
            <div className="action-icon">
              <PlusSquare size={32} />
            </div>
            <div className="action-content">
              <h3>Create New Board</h3>
              <p>Start a fresh collaborative workspace for your team</p>
              <button 
                onClick={createNewBoard} 
                disabled={loading} 
                className="action-button primary"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusSquare size={18} />
                    Create Board
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="action-card join-card">
            <div className="action-icon">
              <Users size={32} />
            </div>
            <div className="action-content">
              <h3>Join Existing Board</h3>
              <p>Connect to a board using an invitation link or ID</p>
              <button 
                onClick={() => setShowJoinModal(true)} 
                className="action-button secondary"
              >
                <Link2 size={18} />
                Join Board
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {/* <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">Active Boards</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">Collaborators</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">Tasks Completed</div>
          </div>
        </div> */}
      </main>

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Join a Board</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowJoinModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleJoinSubmit} className="join-form">
                <div className="form-group">
                  <label htmlFor="joinCode">Board ID or URL</label>
                  <input
                    id="joinCode"
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter board ID or paste invitation URL"
                    className="form-input"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="button primary">
                    <Link2 size={18} />
                    Join Board
                  </button>
                  <button 
                    type="button" 
                    className="button secondary" 
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;