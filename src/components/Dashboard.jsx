import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { PlusCircle, MinusCircle } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';
import { translations } from '../i18n';

const Dashboard = () => {
  const { transactions, budgetSettings, userName, language } = useBudget();
  const [modalType, setModalType] = useState(null); // 'income' or 'expense'
  const t = translations[language];

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  // Calculate budget proportions based on Income
  // Needs + Wants = Total Budget for Expenses
  const maxExpensesAllowed = (totalIncome * (budgetSettings.needs + budgetSettings.wants)) / 100;
  const expensePercentage = maxExpensesAllowed === 0 ? 0 : Math.min(100, (totalExpense / maxExpensesAllowed) * 100);
  
  const isOverBudget = totalExpense > maxExpensesAllowed;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  return (
    <div className="pb-8">
      <h1 className="text-xl font-bold mb-6 text-primary-color">{t.hello}, {userName}! 👋</h1>
      
      {/* Balance Card */}
      <div className="card mb-8" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)', color: '#fff', border: 'none', overflow: 'hidden' }}>
        <p className="text-sm opacity-90 mb-1" style={{ color: '#fff' }}>{t.totalBalance}</p>
        <h2 className="font-bold mb-6" style={{ fontSize: 'clamp(1.2rem, 7vw, 2.5rem)', color: '#fff', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatCurrency(balance)}</h2>
        
        <div className="flex justify-between mt-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(5px)' }}>
          <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: 0 }}>
            <span className="flex items-center gap-1.5 text-xs opacity-90" style={{ color: '#fff', whiteSpace: 'nowrap' }}>
              <PlusCircle size={14} style={{ flexShrink: 0 }} /> 
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.income}</span>
            </span>
            <span className="font-bold text-sm sm:text-base" style={{ color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatCurrency(totalIncome)}
            </span>
          </div>
          
          <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 8px' }}></div>
          
          <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: 0 }}>
            <span className="flex items-center gap-1.5 text-xs opacity-90" style={{ color: '#fff', whiteSpace: 'nowrap' }}>
              <MinusCircle size={14} style={{ flexShrink: 0 }} /> 
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.expense}</span>
            </span>
            <span className="font-bold text-sm sm:text-base" style={{ color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {formatCurrency(totalExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="card mb-8">
        <h3 className="font-bold mb-4">{t.budgetStatus}</h3>
        <p className="text-sm text-secondary mb-4">
          {isOverBudget 
            ? t.overbudget
            : `${t.spent} ${expensePercentage.toFixed(1)}% ${t.allowed}`}
        </p>
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${expensePercentage}%`,
              backgroundColor: isOverBudget ? 'var(--accent-expense)' : 'var(--primary-color)' 
            }}
          ></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button 
          className="btn btn-outline w-full flex-col items-center justify-center gap-3"
          onClick={() => setModalType('income')}
          style={{ padding: '1rem', height: 'auto', borderRadius: '16px' }}
        >
          <div className="btn-icon bg-income" style={{ color: '#fff' }}>
            <PlusCircle size={24} />
          </div>
          <span>{t.addIncome}</span>
        </button>
        <button 
          className="btn btn-outline w-full flex-col items-center justify-center gap-3"
          onClick={() => setModalType('expense')}
          style={{ padding: '1rem', height: 'auto', borderRadius: '16px' }}
        >
          <div className="btn-icon bg-expense" style={{ color: '#fff' }}>
            <MinusCircle size={24} />
          </div>
          <span>{t.addExpense}</span>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="card mb-8">
        <h3 className="font-bold mb-4">{t.recentTrans}</h3>
        {transactions.slice(0, 3).map(t_item => (
          <div key={t_item.id} className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <p className="font-bold">{t_item.title}</p>
              <p className="text-sm text-secondary">{new Date(t_item.date).toLocaleDateString()}</p>
            </div>
            <p className={`font-bold ${t_item.type === 'income' ? 'text-income' : 'text-expense'}`}>
              {t_item.type === 'income' ? '+' : '-'}{formatCurrency(t_item.amount)}
            </p>
          </div>
        ))}
        {transactions.length === 0 && <p className="text-sm text-center text-secondary">No transactions yet.</p>}
      </div>

      {modalType && (
        <AddTransactionModal 
          type={modalType} 
          onClose={() => setModalType(null)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
