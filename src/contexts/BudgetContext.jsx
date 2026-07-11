import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addMonths, isBefore } from 'date-fns';

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

  const [hasOnboarded, setHasOnboarded] = useState(() => {
    return localStorage.getItem('budget_has_onboarded') === 'true';
  });

  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('budget_currency') || 'IDR';
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

  useEffect(() => {
    localStorage.setItem('budget_has_onboarded', hasOnboarded);
  }, [hasOnboarded]);

  useEffect(() => {
    localStorage.setItem('budget_currency', currency);
  }, [currency]);

  // Process Recurring Transactions
  useEffect(() => {
    let hasChanges = false;
    const now = new Date();
    const updatedTransactions = [...transactions];

    transactions.forEach(t => {
      if (t.isRecurring && t.nextRecurringDate) {
        let nextDate = new Date(t.nextRecurringDate);
        
        while (isBefore(nextDate, now)) {
          // create a duplicate for this recurrence
          const newTx = {
            ...t,
            id: uuidv4(),
            date: nextDate.toISOString(),
            nextRecurringDate: null // The new duplicate is not the tracker, the original one is
          };
          updatedTransactions.push(newTx);
          
          // update the next date on the original tracker
          nextDate = addMonths(nextDate, 1);
          t.nextRecurringDate = nextDate.toISOString();
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      // Sort so newest dates are on top (or maintain original order logic)
      updatedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(updatedTransactions);
    }
  }, []); // Run only once on mount

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
      setTransactions,
      budgetSettings,
      userName,
      setUserName,
      language,
      setLanguage,
      hasOnboarded,
      setHasOnboarded,
      currency,
      setCurrency,
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
