import React, { useState } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { translations } from '../i18n';
import { Wallet, ArrowRight, Check } from 'lucide-react';

const Onboarding = () => {
  const { userName, setUserName, currency, setCurrency, setHasOnboarded, language, setLanguage } = useBudget();
  const t = translations[language];
  const [step, setStep] = useState(1);

  const handleFinish = () => {
    if (!userName.trim()) setUserName('Saver');
    setHasOnboarded(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 fixed inset-0 z-50 bg-background" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div className="card w-full max-w-md p-8 text-center flex flex-col items-center">
        
        {step === 1 && (
          <div className="flex flex-col items-center animate-fade-in w-full">
            <div className="w-20 h-20 bg-primary-color rounded-full flex items-center justify-center text-white mb-6 shadow-lg">
              <Wallet size={40} />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-primary-color">{t.onboardingWelcome}</h1>
            <p className="text-secondary mb-8">{t.onboardingDesc}</p>
            
            <div className="w-full text-left mb-6">
              <label className="block text-sm font-medium mb-2">{t.language}</label>
              <select 
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-color"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="id">Bahasa Indonesia</option>
              </select>
            </div>

            <button 
              className="btn-primary w-full flex items-center justify-center gap-2"
              onClick={() => setStep(2)}
            >
              {t.start} <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center animate-fade-in w-full">
            <h2 className="text-xl font-bold mb-6 text-primary-color">{t.profile}</h2>
            
            <div className="w-full text-left mb-4">
              <label className="block text-sm font-medium mb-2">{t.name}</label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-color"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="w-full text-left mb-8">
              <label className="block text-sm font-medium mb-2">{t.currency}</label>
              <select 
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-color"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="IDR">IDR (Rp)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <button 
              className="btn-primary w-full flex items-center justify-center gap-2"
              onClick={handleFinish}
            >
              {t.finish} <Check size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
