import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Save, AlertTriangle, CheckCircle, X, User, Download, Upload } from 'lucide-react';
import { translations } from '../i18n';

const Settings = () => {
  const { budgetSettings, updateBudgetSettings, resetData, userName, setUserName, language, setLanguage, currency, setCurrency, transactions, setTransactions } = useBudget();
  const { theme, toggleTheme } = useTheme();
  const t = translations[language];
  
  const [needs, setNeeds] = useState(budgetSettings.needs);
  const [wants, setWants] = useState(budgetSettings.wants);
  const [savings, setSavings] = useState(budgetSettings.savings);
  
  const [tempUserName, setTempUserName] = useState(userName);
  const [tempLanguage, setTempLanguage] = useState(language);
  const [tempCurrency, setTempCurrency] = useState(currency);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const total = Number(needs) + Number(wants) + Number(savings);
  const isInvalid = total !== 100;

  const handleSave = (e) => {
    e.preventDefault();
    if (!isInvalid) {
      updateBudgetSettings({
        needs: Number(needs),
        wants: Number(wants),
        savings: Number(savings)
      });
      setSuccessMessage(language === 'id' ? 'Proporsi anggaran berhasil disimpan!' : 'Budget proportions saved successfully!');
      setShowSuccessModal(true);
    }
  };

  const handleExport = () => {
    const data = {
      transactions,
      budgetSettings,
      userName,
      currency,
      language
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "budget_tracker_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.transactions) setTransactions(data.transactions);
        if (data.budgetSettings) updateBudgetSettings(data.budgetSettings);
        if (data.userName) setUserName(data.userName);
        if (data.currency) setCurrency(data.currency);
        if (data.language) setLanguage(data.language);
        
        setSuccessMessage(language === 'id' ? 'Data berhasil diimpor!' : 'Data imported successfully!');
        setShowSuccessModal(true);
      } catch (err) {
        alert(language === 'id' ? 'Gagal: File JSON tidak valid' : 'Failed: Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="pb-8">
      <h1 className="text-xl font-bold mb-6 text-primary-color">{t.settings}</h1>
      
      {/* Profile & Language */}
      <div className="card mb-8">
        <h3 className="font-bold mb-4 flex items-center gap-2"><User size={20}/> {t.profile}</h3>
        <div className="input-group">
          <label className="input-label">{t.name}</label>
          <input 
            type="text" 
            className="input-field" 
            value={tempUserName} 
            onChange={(e) => setTempUserName(e.target.value)} 
          />
        </div>
        <div className="input-group mb-4">
          <label className="input-label">{t.language}</label>
          <select 
            className="input-field" 
            value={tempLanguage} 
            onChange={(e) => setTempLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </div>
        
        <div className="input-group mb-4">
          <label className="input-label">{t.currency}</label>
          <select 
            className="input-field" 
            value={tempCurrency} 
            onChange={(e) => setTempCurrency(e.target.value)}
          >
            <option value="IDR">IDR (Rp)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
        
        {/* Save & Reset Actions for Profile */}
        {(tempUserName !== userName || tempLanguage !== language || tempCurrency !== currency) && (
          <div className="flex gap-4 mt-4">
            <button 
              className="btn btn-outline w-full"
              onClick={() => {
                setTempUserName(userName);
                setTempLanguage(language);
              }}
            >
              {t.cancel}
            </button>
            <button 
              className="btn btn-primary w-full"
              onClick={() => {
                setUserName(tempUserName);
                setLanguage(tempLanguage);
                setCurrency(tempCurrency);
                setSuccessMessage(tempLanguage === 'id' ? 'Profil berhasil disimpan!' : 'Profile settings saved successfully!');
                setShowSuccessModal(true);
              }}
            >
              {t.save}
            </button>
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <div className="card mb-8 flex justify-between items-center">
        <div>
          <h3 className="font-bold">{t.appTheme}</h3>
          <p className="text-sm text-secondary">
            {theme === 'light' ? 'Girly Pink Pastel' : 'Macho Dark Slate'}
          </p>
        </div>
        <button 
          className="btn-icon bg-surface-color" 
          style={{ border: '1px solid var(--border-color)' }}
          onClick={toggleTheme}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      {/* Budget Proportions */}
      <div className="card mb-8">
        <h3 className="font-bold mb-4">{t.budgetProps}</h3>
        <p className="text-sm text-secondary mb-6">
          {t.setIdeal}
        </p>
        
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label className="input-label flex justify-between">
              <span>{t.needs} (%)</span>
              <span>{needs}%</span>
            </label>
            <input 
              type="range" 
              min="0" max="100" 
              value={needs} 
              onChange={(e) => setNeeds(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="input-group">
            <label className="input-label flex justify-between">
              <span>{t.wants} (%)</span>
              <span>{wants}%</span>
            </label>
            <input 
              type="range" 
              min="0" max="100" 
              value={wants} 
              onChange={(e) => setWants(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="input-group mb-4">
            <label className="input-label flex justify-between">
              <span>{t.savings} (%)</span>
              <span>{savings}%</span>
            </label>
            <input 
              type="range" 
              min="0" max="100" 
              value={savings} 
              onChange={(e) => setSavings(e.target.value)}
              className="w-full"
            />
          </div>

          <div className={`p-3 rounded-xl mb-6 text-sm text-center ${isInvalid ? 'bg-expense text-white' : 'bg-surface-color'}`} style={{ border: isInvalid ? 'none' : '1px solid var(--border-color)' }}>
            {t.totalAlloc}: <strong>{total}%</strong>
            {isInvalid && <p className="mt-1">{t.adjust100}</p>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={isInvalid}
            style={{ opacity: isInvalid ? 0.5 : 1 }}
          >
            <Save size={20} />
            {t.saveProps}
          </button>
        </form>
      </div>

      {/* Data Management */}
      <div className="card mb-8">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Download size={20} /> Data Management</h3>
        <p className="text-sm text-secondary mb-4">{t.exportDesc}</p>
        <button 
          className="btn btn-outline w-full flex items-center justify-center gap-2 mb-4"
          onClick={handleExport}
        >
          <Download size={18} /> {t.exportData}
        </button>
        
        <p className="text-sm text-secondary mb-4">{t.importDesc}</p>
        <label className="btn btn-outline w-full flex items-center justify-center gap-2 cursor-pointer">
          <Upload size={18} /> {t.importData}
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
      </div>

      {/* Danger Zone */}
      <div className="card mb-8" style={{ borderColor: 'var(--accent-expense)' }}>
        <h3 className="font-bold mb-2 flex items-center gap-2 text-expense">
          <AlertTriangle size={20} /> {t.dangerZone}
        </h3>
        <p className="text-sm text-secondary mb-4">
          {t.dangerDesc}
        </p>
        <button 
          className="btn w-full flex items-center justify-center gap-2 bg-expense" 
          style={{ color: '#fff' }}
          onClick={() => setShowConfirmModal(true)}
        >
          {t.resetAll}
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-expense flex items-center gap-2">
                <AlertTriangle size={24} /> Warning
              </h2>
              <button onClick={() => setShowConfirmModal(false)} className="btn-icon" style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            <p className="mb-6 text-center text-sm">
              Are you sure you want to delete <strong>ALL</strong> your budget data? <br/>This action is permanent and cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                className="btn btn-outline w-full"
                onClick={() => setShowConfirmModal(false)}
              >
                {t.cancel}
              </button>
              <button 
                className="btn w-full bg-expense"
                style={{ color: '#fff' }}
                onClick={() => {
                  resetData();
                  setShowConfirmModal(false);
                  setSuccessMessage(language === 'id' ? 'Seluruh transaksi Anda telah berhasil dihapus. Siap mulai dari nol!' : 'All your transactions have been successfully cleared. You are ready to start fresh!');
                  setShowSuccessModal(true);
                }}
              >
                {t.resetAll}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div className="flex justify-center mb-4 mt-2">
              <CheckCircle size={64} className="text-income" />
            </div>
            <h2 className="text-xl font-bold mb-2">Success!</h2>
            <p className="mb-6 text-sm text-secondary">
              {successMessage}
            </p>
            <button 
              className="btn btn-primary w-full"
              onClick={() => setShowSuccessModal(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
