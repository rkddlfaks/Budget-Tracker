import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Stats from './components/Stats';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import { Home, PieChart, Settings as SettingsIcon } from 'lucide-react';
import { useBudget } from './contexts/BudgetContext';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { hasOnboarded } = useBudget();

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
    </div>
  );
}

export default App;
