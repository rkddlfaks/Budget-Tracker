import React, { useState, useEffect } from 'react';
import { useBudget } from '../contexts/BudgetContext';
import { ArrowRight, Globe, Coins, Sparkles, Check, ChevronRight } from 'lucide-react';

const Onboarding = () => {
  const { userName, setUserName, currency, setCurrency, setHasOnboarded, language, setLanguage } = useBudget();
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleNext = (nextStep) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 300); // 300ms for exit animation
  };

  const handleFinish = () => {
    if (!userName.trim()) setUserName('Saver');
    setHasOnboarded(true);
  };

  // Glassmorphism and gradient styles
  const overlayStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, var(--bg-color) 0%, var(--border-color) 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  };

  const blob1 = {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '300px',
    height: '300px',
    background: 'var(--primary-color)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.4,
    zIndex: 0,
    animation: 'pulse 4s infinite alternate',
  };

  const blob2 = {
    position: 'absolute',
    bottom: '-10%',
    right: '-10%',
    width: '250px',
    height: '250px',
    background: 'var(--accent-income)',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.3,
    zIndex: 0,
    animation: 'pulse 5s infinite alternate-reverse',
  };

  const cardStyle = {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '420px',
    minHeight: '400px',
    backgroundColor: 'var(--surface-transparent)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '24px',
    padding: '2.5rem 2rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: isTransitioning ? 'scale(0.95) translateY(10px)' : 'scale(1) translateY(0)',
    opacity: isTransitioning ? 0 : 1,
  };

  const iconContainerStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    marginBottom: '2rem',
    boxShadow: '0 10px 25px -5px rgba(var(--primary-color), 0.5)',
  };

  const renderProgressDots = () => {
    return (
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            style={{ 
              width: i === step ? '24px' : '8px', 
              height: '8px', 
              borderRadius: '9999px',
              backgroundColor: i === step ? 'var(--primary-color)' : 'var(--border-color)',
              transition: 'all 0.3s ease'
            }} 
          />
        ))}
      </div>
    );
  };

  return (
    <div style={overlayStyle}>
      <div style={blob1}></div>
      <div style={blob2}></div>
      
      <div style={cardStyle}>
        <div className="w-full flex flex-col items-center">
          {renderProgressDots()}

          {step === 1 && (
            <>
              <div style={iconContainerStyle}>
                <Sparkles size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-center">Siapa Namamu?</h2>
              <p className="text-secondary text-center mb-8">Mari berkenalan sebelum kita mulai.</p>
              
              <div className="w-full mb-8">
                <input 
                  type="text" 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ketik namamu..."
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    fontSize: '1.25rem',
                    textAlign: 'center',
                    borderRadius: '16px',
                    border: '2px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && userName.trim() && handleNext(2)}
                />
              </div>
              
              <button 
                className="btn btn-primary w-full flex items-center justify-center gap-2"
                onClick={() => handleNext(2)}
                disabled={!userName.trim()}
                style={{ 
                  padding: '1.25rem', 
                  fontSize: '1.125rem',
                  borderRadius: '16px',
                  opacity: userName.trim() ? 1 : 0.5,
                  transform: userName.trim() ? 'translateY(0)' : 'translateY(0)',
                }}
              >
                Lanjut <ChevronRight size={24} />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div style={iconContainerStyle}>
                <Globe size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-center">Pilih Bahasa</h2>
              <p className="text-secondary text-center mb-8">Kamu lebih nyaman pakai bahasa apa?</p>
              
              <div className="flex flex-col gap-4 w-full">
                <button 
                  className={`btn w-full ${language === 'id' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => { setLanguage('id'); handleNext(3); }}
                  style={{ padding: '1.25rem', fontSize: '1.125rem', borderRadius: '16px' }}
                >
                  🇮🇩 Bahasa Indonesia
                </button>
                <button 
                  className={`btn w-full ${language === 'en' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => { setLanguage('en'); handleNext(3); }}
                  style={{ padding: '1.25rem', fontSize: '1.125rem', borderRadius: '16px' }}
                >
                  🇺🇸 English
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={iconContainerStyle}>
                <Coins size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-center">
                {language === 'id' ? 'Pilih Mata Uang' : 'Select Currency'}
              </h2>
              <p className="text-secondary text-center mb-8">
                {language === 'id' ? 'Mata uang apa yang kamu gunakan?' : 'Which currency do you use?'}
              </p>
              
              <div className="flex flex-col gap-4 w-full">
                {['IDR', 'USD', 'EUR'].map(curr => (
                  <button 
                    key={curr}
                    className={`btn w-full ${currency === curr ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => { setCurrency(curr); handleNext(4); }}
                    style={{ padding: '1.25rem', fontSize: '1.125rem', borderRadius: '16px' }}
                  >
                    {curr === 'IDR' ? 'IDR (Rp)' : curr === 'USD' ? 'USD ($)' : 'EUR (€)'}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div style={iconContainerStyle}>
                <Check size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-center">
                {language === 'id' ? `Halo, ${userName}! 👋` : `Hello, ${userName}! 👋`}
              </h2>
              <p className="text-secondary text-center mb-8">
                {language === 'id' 
                  ? 'Semua sudah siap. Yuk mulai petualangan finansialmu yang baru!' 
                  : 'Everything is set. Let\'s start your new financial adventure!'}
              </p>
              
              <button 
                className="btn btn-primary w-full flex items-center justify-center gap-2"
                onClick={handleFinish}
                style={{ padding: '1.25rem', fontSize: '1.125rem', borderRadius: '16px' }}
              >
                {language === 'id' ? 'Mulai Sekarang' : 'Start Now'} <ArrowRight size={24} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
