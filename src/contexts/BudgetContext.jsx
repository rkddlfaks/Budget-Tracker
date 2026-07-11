import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('budget_username') || 'Saver';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('budget_language') || 'en';
  });

  const [budgetSettings, setBudgetSettings] = useState(() => {
    const saved = localStorage.getItem('budgetSettings');
    return saved ? JSON.parse(saved) : { needs: 50, wants: 30, savings: 20 };
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('budgetSettings', JSON.stringify(budgetSettings));
  }, [budgetSettings]);

  useEffect(() => {
    localStorage.setItem('budget_username', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('budget_language', language);
  }, [language]);

  const addTransaction = (transaction) => {
    setTransactions(prev => [{ ...transaction, id: uuidv4(), date: new Date().toISOString() }, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const resetData = () => {
    setTransactions([]);
  };

  const updateBudgetSettings = (settings) => {
    setBudgetSettings(settings);
  };

  return (
    <BudgetContext.Provider value={{
      transactions,
      budgetSettings,
      userName,
      setUserName,
      language,
      setLanguage,
      addTransaction,
      deleteTransaction,
      resetData,
      updateBudgetSettings
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);
