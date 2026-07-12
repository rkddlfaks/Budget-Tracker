import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Stats from './components/Stats';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import { Home, PieChart, Settings as SettingsIcon } from 'lucide-react';
import { useBudget } from './contexts/BudgetContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { hasOnboarded, toast } = useBudget();

  if (!hasOnboarded) {
    return <Onboarding />;
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

      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification" style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#10b981' : 'var(--accent-expense)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '50px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontWeight: 'bold',
          fontSize: '0.9rem',
          animation: 'slideUp 0.3s ease-out forwards',
          whiteSpace: 'nowrap'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
