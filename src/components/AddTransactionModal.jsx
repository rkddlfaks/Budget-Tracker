import React, { useState, useEffect } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { translations } from '../i18n';
import { Mic, X } from 'lucide-react';

const AddTransactionModal = ({ type, onClose }) => {
  const { addTransaction, language } = useBudget();
  const t = translations[language];
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('needs');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
    if (parsedTitle.length > 0) setTitle(parsedTitle.join(' '));
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognition?.stop();
    } else {
      recognition?.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !title) return;
    
    addTransaction({
      type,
      amount: Number(amount),
      title,
      category: type === 'expense' ? category : 'income',
      date
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold mb-6">
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
            <input 
              type="text" 
              className="input-field"
              required
              value={amount ? new Intl.NumberFormat('id-ID').format(amount) : ''}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '');
                setAmount(rawValue);
              }}
              placeholder="e.g. 50.000"
            />
          </div>

          <div className="input-group">
            <label className="input-label">{t.title}</label>
            <input 
              type="text" 
              className="input-field"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'income' ? "e.g. Salary" : "e.g. Lunch"}
            />
          </div>

          {type === 'expense' && (
            <div className="input-group">
              <label className="input-label">{t.category}</label>
              <select 
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="needs">{t.needs}</option>
                <option value="wants">{t.wants}</option>
              </select>
            </div>
          )}

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

          <button type="submit" className="btn btn-primary w-full mt-4">
            {t.save}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
