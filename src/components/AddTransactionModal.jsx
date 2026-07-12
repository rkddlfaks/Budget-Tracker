import React, { useState, useEffect } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { translations } from '../i18n';
import { Mic, X, Coffee, ShoppingBag, Zap, Car, Film, Briefcase, TrendingUp, HelpCircle, Repeat, PiggyBank } from 'lucide-react';
import { addMonths } from 'date-fns';

const EXPENSE_CATEGORIES = [
  { id: 'Food', icon: Coffee, label: 'Food & Drink' },
  { id: 'Shopping', icon: ShoppingBag, label: 'Shopping' },
  { id: 'Bills', icon: Zap, label: 'Bills' },
  { id: 'Transport', icon: Car, label: 'Transport' },
  { id: 'Entertainment', icon: Film, label: 'Entertainment' },
  { id: 'Savings', icon: PiggyBank, label: 'Savings' },
  { id: 'Other', icon: HelpCircle, label: 'Other' }
];

const INCOME_CATEGORIES = [
  { id: 'Salary', icon: Briefcase, label: 'Salary' },
  { id: 'Investment', icon: TrendingUp, label: 'Investment' },
  { id: 'Other', icon: HelpCircle, label: 'Other' }
];

const AddTransactionModal = ({ type, onClose }) => {
  const { addTransaction, language } = useBudget();
  const t = translations[language];
  const [amount, setAmount] = useState('');
  
  const categoriesList = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const [selectedSmartCat, setSelectedSmartCat] = useState(categoriesList[0].id);
  const [note, setNote] = useState('');
  
  const [category, setCategory] = useState('needs');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Setup Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = 'id-ID';
      rec.continuous = false;
      rec.interimResults = false;

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        parseVoiceInput(transcript);
        setIsRecording(false);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const parseVoiceInput = (text) => {
    const words = text.split(' ');
    let parsedAmount = '';
    let parsedTitle = [];

    words.forEach(word => {
      const num = parseInt(word.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(num) && num > 0 && parsedAmount === '') {
        parsedAmount = num.toString();
      } else {
        parsedTitle.push(word);
      }
    });

    if (parsedAmount) setAmount(parsedAmount);
    if (parsedTitle.length > 0) setNote(parsedTitle.join(' '));
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsRecording(true);
    }
  };

  const handleAmountChange = (e) => {
    // Hanya izinkan angka, buang semua karakter lain (termasuk titik dan koma)
    const rawValue = e.target.value.replace(/\D/g, '');
    setAmount(rawValue);
  };

  const formatDisplayAmount = (val) => {
    if (!val) return '';
    // Format murni dengan pemisah ribuan titik (.)
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    
    const finalTitle = note ? `${selectedSmartCat} - ${note}` : selectedSmartCat;
    
    // Auto-map Smart Category to Needs/Wants/Savings for laymen
    let autoCategory = 'wants';
    if (['Food', 'Bills', 'Transport'].includes(selectedSmartCat)) {
      autoCategory = 'needs';
    } else if (selectedSmartCat === 'Savings') {
      autoCategory = 'savings';
    }
    
    addTransaction({
      type,
      amount: Number(amount),
      title: finalTitle,
      category: type === 'expense' ? autoCategory : 'income',
      date,
      isRecurring,
      nextRecurringDate: isRecurring ? addMonths(new Date(date), 1).toISOString() : null
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {type === 'income' ? t.addIncome : t.addExpense}
          </h2>
          <button onClick={onClose} className="btn-icon" style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Voice Input Section */}
        <div className="mb-6 p-4 rounded-xl bg-surface-color" style={{ border: '1px solid var(--border-color)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm">{t.voiceInput}</span>
            <button 
              type="button"
              className={`btn-icon ${isRecording ? 'pulse bg-expense text-white' : 'bg-primary-color text-bg-color'}`}
              onClick={toggleRecording}
            >
              <Mic size={20} />
            </button>
          </div>
          <p className="text-xs text-secondary">
            {isRecording ? t.voiceListening : t.voiceDesc}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">{t.amount}</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                {language === 'id' ? 'Rp' : '$'}
              </span>
              <input 
                type="text" 
                inputMode="decimal"
                className="input-field"
                required
                value={formatDisplayAmount(amount)}
                onChange={handleAmountChange}
                placeholder="e.g. 50.000"
                style={{ paddingLeft: '3rem' }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t.smartCategories}</label>
            <div className="smart-cat-grid mb-4">
              {categoriesList.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedSmartCat(cat.id)}
                  className={`smart-cat-btn ${selectedSmartCat === cat.id ? 'active' : ''}`}
                >
                  <cat.icon size={20} />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t.customNote}</label>
            <input 
              type="text" 
              className="input-field"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lunch with client"
            />
          </div>



          <div className="input-group">
            <label className="input-label">{t.date}</label>
            <input 
              type="date" 
              className="input-field"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 bg-surface-color hover:bg-gray-50 transition-colors">
              <input 
                type="checkbox" 
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 accent-primary-color"
              />
              <Repeat size={18} className={isRecurring ? 'text-primary-color' : 'text-secondary'} />
              <span className={`text-sm font-medium ${isRecurring ? 'text-primary-color' : ''}`}>{t.recurring}</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-full">
            {t.save}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
