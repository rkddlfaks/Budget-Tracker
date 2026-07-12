import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { PlusCircle, MinusCircle, Search, Trash2, X } from 'lucide-react';
import AddTransactionModal from './AddTransactionModal';
import confetti from 'canvas-confetti';
import { translations } from '../i18n';

const Dashboard = () => {
  const { transactions, budgetSettings, userName, language, currency, deleteTransaction } = useBudget();
  const [modalType, setModalType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const t = translations[language];

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + Number(t.amount), 0);
    
  const balance = totalIncome - totalExpense;
    
  // Calculate specific targets
  const targetNeeds = (totalIncome * budgetSettings.needs) / 100;
  const targetWants = (totalIncome * budgetSettings.wants) / 100;
  const targetSavings = (totalIncome * budgetSettings.savings) / 100;

  // Calculate actual spending/saving
  const actualNeeds = transactions.filter(t => t.type === 'expense' && t.category === 'needs').reduce((acc, t) => acc + Number(t.amount), 0);
  const actualWants = transactions.filter(t => t.type === 'expense' && t.category === 'wants').reduce((acc, t) => acc + Number(t.amount), 0);
  
  // Actual savings now only counts manual savings (Simpan ke Tabungan)
  // This prevents it from instantly showing as full when income is added.
  const actualSavings = transactions.filter(t => t.type === 'expense' && t.category === 'savings').reduce((acc, t) => acc + Number(t.amount), 0);

  // Percentages for progress bars
  const pctNeeds = targetNeeds === 0 ? 0 : Math.min(100, (actualNeeds / targetNeeds) * 100);
  const pctWants = targetWants === 0 ? 0 : Math.min(100, (actualWants / targetWants) * 100);
  const pctSavings = targetSavings === 0 ? 0 : Math.min(100, (actualSavings / targetSavings) * 100);

  const overNeeds = actualNeeds >= targetNeeds && targetNeeds > 0;
  const overWants = actualWants >= targetWants && targetWants > 0;
  const savingsFull = actualSavings >= targetSavings && targetSavings > 0;
  const budgetSpent = actualNeeds + actualWants;
  const isOverBudget = budgetSpent > (targetNeeds + targetWants);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', { 
      style: 'currency', 
      currency: currency || 'IDR' 
    }).format(amount);
  };

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  const filteredTransactions = sortedTransactions.filter(tr => 
    tr.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-8">
      <h1 className="text-xl font-bold mb-6 text-primary-color">{t.hello}, {userName}! 👋</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-left">
          {/* Balance Card */}
          <div className="card mb-8" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)', color: '#fff', border: 'none', overflow: 'hidden' }}>
            <p className="text-sm opacity-90 mb-1" style={{ color: '#fff' }}>{t.totalBalance}</p>
            <h2 className="font-bold mb-6" style={{ fontSize: 'clamp(1.2rem, 7vw, 2.5rem)', color: '#fff', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{formatCurrency(balance)}</h2>
            
            <div className="flex justify-between mt-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(5px)' }}>
              <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: 0 }}>
                <span className="flex items-center text-xs opacity-90" style={{ color: '#fff', whiteSpace: 'nowrap', gap: '6px' }}>
                  <PlusCircle size={14} style={{ flexShrink: 0 }} /> 
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.income}</span>
                </span>
                <span className="font-bold text-sm sm:text-base" style={{ color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {formatCurrency(totalIncome)}
                </span>
              </div>
              
              <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.3)', margin: '0 8px' }}></div>
              
              <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: 0 }}>
                <span className="flex items-center text-xs opacity-90" style={{ color: '#fff', whiteSpace: 'nowrap', gap: '6px' }}>
                  <MinusCircle size={14} style={{ flexShrink: 0 }} /> 
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.expense}</span>
                </span>
                <span className="font-bold text-sm sm:text-base" style={{ color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {formatCurrency(totalExpense)}
                </span>
              </div>
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

          {/* Budget Progress */}
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">{t.budgetStatus}</h3>
            </div>
            <div className="flex flex-col gap-5 mt-2">
              {/* Needs Bar */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-bold text-sm">{language === 'id' ? 'Kebutuhan' : 'Needs'} <span className="text-xs font-normal text-secondary ml-1">({budgetSettings.needs}%)</span></p>
                    <p className="text-xs text-secondary mt-1">
                      {language === 'id' ? `Terpakai ${formatCurrency(actualNeeds)} / Target ${formatCurrency(targetNeeds)}` : `Spent ${formatCurrency(actualNeeds)} / Target ${formatCurrency(targetNeeds)}`}
                    </p>
                  </div>
                  {overNeeds && <span className="text-xs font-bold text-expense">{language === 'id' ? 'Overbudget!' : 'Overbudget!'}</span>}
                </div>
                <div className="progress-container h-2">
                  <div 
                    className="progress-bar h-2" 
                    style={{ 
                      width: `${pctNeeds}%`,
                      backgroundColor: overNeeds ? 'var(--accent-expense)' : 'var(--primary-color)' 
                    }}
                  ></div>
                </div>
              </div>

              {/* Wants Bar */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-bold text-sm">{language === 'id' ? 'Keinginan' : 'Wants'} <span className="text-xs font-normal text-secondary ml-1">({budgetSettings.wants}%)</span></p>
                    <p className="text-xs text-secondary mt-1">
                      {language === 'id' ? `Terpakai ${formatCurrency(actualWants)} / Target ${formatCurrency(targetWants)}` : `Spent ${formatCurrency(actualWants)} / Target ${formatCurrency(targetWants)}`}
                    </p>
                  </div>
                  {overWants && <span className="text-xs font-bold text-expense">{language === 'id' ? 'Overbudget!' : 'Overbudget!'}</span>}
                </div>
                <div className="progress-container h-2">
                  <div 
                    className="progress-bar h-2" 
                    style={{ 
                      width: `${pctWants}%`,
                      backgroundColor: overWants ? 'var(--accent-expense)' : '#f59e0b' 
                    }}
                  ></div>
                </div>
              </div>

              {/* Savings Bar */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="font-bold text-sm">{language === 'id' ? 'Tabungan' : 'Savings'} <span className="text-xs font-normal text-secondary ml-1">({budgetSettings.savings}%)</span></p>
                    <p className="text-xs text-secondary mt-1">
                      {language === 'id' ? `Terkumpul ${formatCurrency(actualSavings)} / Target ${formatCurrency(targetSavings)}` : `Saved ${formatCurrency(actualSavings)} / Target ${formatCurrency(targetSavings)}`}
                    </p>
                  </div>
                </div>
                <div className="progress-container h-2">
                  <div 
                    className="progress-bar h-2" 
                    style={{ 
                      width: `${pctSavings}%`,
                      backgroundColor: savingsFull ? '#10b981' : 'var(--primary-color)' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-right">
          {/* Transaction History & Search */}
          <div className="card mb-8">
            <h3 className="font-bold mb-4">{t.history}</h3>
            
            <div className="input-group mb-4" style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder={t.search}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </div>

            {filteredTransactions.slice(0, 10).map(t_item => (
              <div key={t_item.id} className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                  <p className="font-bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t_item.title}</p>
                  <p className="text-sm text-secondary">{new Date(t_item.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <p className={`font-bold ${t_item.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {t_item.type === 'income' ? '+' : '-'}{formatCurrency(t_item.amount)}
                  </p>
                  <button 
                    onClick={() => setTransactionToDelete(t_item.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-expense)', cursor: 'pointer', padding: '4px' }}
                    title={language === 'id' ? 'Hapus' : 'Delete'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            
            {filteredTransactions.length > 10 && (
              <button 
                className="btn btn-outline w-full mt-2" 
                onClick={() => setShowAllHistory(true)}
              >
                {language === 'id' ? 'Lihat Semua Transaksi' : 'View All Transactions'}
              </button>
            )}
            {filteredTransactions.length === 0 && (
              <p className="text-sm text-center text-secondary py-4">
                {searchQuery ? 'No matching transactions.' : 'No transactions yet.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {modalType && (
        <AddTransactionModal 
          type={modalType} 
          onClose={() => setModalType(null)} 
        />
      )}

      {showAllHistory && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-bold">{language === 'id' ? 'Semua Riwayat Transaksi' : 'All Transaction History'}</h2>
              <button onClick={() => setShowAllHistory(false)} className="btn-icon" style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="input-group mb-4 shrink-0" style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder={t.search}
                className="input-field"
                style={{ paddingLeft: '2.5rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
              {filteredTransactions.map(t_item => (
                <div key={t_item.id} className="flex justify-between items-center mb-3 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                    <p className="font-bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t_item.title}</p>
                    <p className="text-sm text-secondary">{new Date(t_item.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className={`font-bold ${t_item.type === 'income' ? 'text-income' : 'text-expense'}`}>
                      {t_item.type === 'income' ? '+' : '-'}{formatCurrency(t_item.amount)}
                    </p>
                    <button 
                      onClick={() => setTransactionToDelete(t_item.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-expense)', cursor: 'pointer', padding: '4px' }}
                      title={language === 'id' ? 'Hapus' : 'Delete'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredTransactions.length === 0 && (
                <p className="text-sm text-center text-secondary py-4">
                  {searchQuery ? 'No matching transactions.' : 'No transactions yet.'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {transactionToDelete && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="mb-4 text-expense flex justify-center">
              <Trash2 size={48} />
            </div>
            <h2 className="text-xl font-bold mb-2">{language === 'id' ? 'Hapus Transaksi?' : 'Delete Transaction?'}</h2>
            <p className="text-secondary mb-6 text-sm">
              {language === 'id' ? 'Data ini akan dihapus permanen dan tidak bisa dikembalikan.' : 'This data will be permanently deleted and cannot be recovered.'}
            </p>
            <div className="flex gap-3">
              <button 
                className="btn btn-outline" 
                style={{ flex: 1 }}
                onClick={() => setTransactionToDelete(null)}
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button 
                className="btn bg-expense" 
                style={{ flex: 1, color: '#fff', border: 'none' }}
                onClick={() => {
                  deleteTransaction(transactionToDelete);
                  setTransactionToDelete(null);
                }}
              >
                {language === 'id' ? 'Ya, Hapus' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
