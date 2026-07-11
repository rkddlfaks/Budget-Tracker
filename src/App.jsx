import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Stats from './components/Stats';
import Settings from './components/Settings';
import { Home, PieChart, Settings as SettingsIcon } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <img src="/logo_rounded.png" alt="Budget App Logo" className="splash-logo" />
          <h1 className="splash-title">Budget Tracker</h1>
        </div>
        <p className="splash-copyright">copyright by Maley</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'stats' && <Stats />}
      {activeTab === 'settings' && <Settings />}

      <nav className="bottom-nav">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Home size={24} />
          <span>Home</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <PieChart size={24} />
          <span>Stats</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={24} />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
