import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { BudgetProvider } from './contexts/BudgetContext.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BudgetProvider>
        <App />
      </BudgetProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
