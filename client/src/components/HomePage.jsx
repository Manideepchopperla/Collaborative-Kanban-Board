
import { 
  CheckSquare, 
  Users, 
  Zap, 
  FileText, 
  Brain, 
  GitMerge,
  Target,
  Activity,
  Star,
  ArrowRight,
  LogIn,
  UserPlus
} from 'lucide-react';
import "../styles/homepage.css";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';



const HomePage = () => {
    useEffect(() => {
  window.scrollTo(0, 0);
}, []);
    const navigate = useNavigate();
  const handleLogin = () => {
    // Navigate to login page
    navigate('/login' );
  };

  const handleRegister = () => {
    // Navigate to register page
    navigate('/register');
  };

  const features = [
    {
      icon: CheckSquare,
      title: "Kanban Board",
      description: "Custom-built three-column board (Todo, In Progress, Done).",
      details: ["Drag-and-drop task movement", "Task reassignment", "Live syncing"]
    },
    {
      icon: Zap,
      title: "Real-Time Sync",
      description: "Changes reflected instantly using WebSockets (Socket.IO).",
      details: ["Instant updates", "Multi-user collaboration", "No page refresh needed"]
    },
    {
      icon: FileText,
      title: "Activity Log",
      description: "Displays last 20 actions (add/edit/delete/assign/move).",
      details: ["Live updating panel", "Complete audit trail", "User action tracking"]
    },
    {
      icon: Brain,
      title: "Smart Assign",
      description: "One-click assignment to the user with the least active tasks.",
      details: ["Intelligent load balancing", "Automated assignment", "Workload optimization"]
    },
    {
      icon: GitMerge,
      title: "Conflict Handling",
      description: "Detects simultaneous edits.",
      details: ["Merge or overwrite options", "Version control", "Data integrity protection"]
    }
  ];

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <div className="container">
          <nav className="navbar">
            <div className="logo">
              <div className="logo-icon">
                <Target size={24} />
              </div>
              <span className="logo-text">CollabBoard</span>
            </div>
            <div className="auth-buttons">
              <button onClick={handleLogin} className="btn btn-outline">
                <LogIn size={16} />
                Login
              </button>
              <button onClick={handleRegister} className="btn btn-primary">
                <UserPlus size={16} />
                Register
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Collaborate Better with CollabBoard
            </h1>
            <p className="hero-subtitle">
              The ultimate collaborative task management platform with real-time sync, 
              smart assignment, and conflict resolution. Perfect for teams of any size.
            </p>
            <div className="hero-cta">
              <button onClick={handleRegister} className="btn btn-primary">
                <UserPlus size={16} />
                Get Started Free
              </button>
              <button onClick={handleLogin} className="btn btn-outline">
                <LogIn size={16} />
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <Star size={32} color="#3b82f6" />
              Powerful Features
            </h2>
            <p className="section-subtitle">
              Everything you need to manage tasks efficiently and collaboratively
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <feature.icon size={24} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <ul className="feature-details">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex}>{detail}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Activity size={32} />
              </div>
              <h3 className="stat-title">Real-Time</h3>
              <p className="stat-description">
                Instant synchronization across all devices and team members
              </p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Users size={32} />
              </div>
              <h3 className="stat-title">Collaborative</h3>
              <p className="stat-description">
                Built for teams of any size with seamless collaboration tools
              </p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Brain size={32} />
              </div>
              <h3 className="stat-title">Smart</h3>
              <p className="stat-description">
                Smart task assignment and intelligent workload optimization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <Target size={20} />
            </div>
            <span className="footer-logo-text">CollabBoard</span>
          </div>
          <p className="footer-description">
            Streamline your workflow with powerful collaboration tools
          </p>
          <p className="footer-copyright">
            © 2025 CollabBoard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;