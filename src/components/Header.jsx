import React, { useState, useEffect } from 'react';
import { Moon, Sun, MessageSquare } from 'lucide-react';

export const Header = ({ hideThemeToggle = false }) => {
  const [contestType, setContestType] = useState(localStorage.getItem('contestType') || 'Concurso Público');
  const [contestNumber, setContestNumber] = useState(localStorage.getItem('contestNumber') || '01/2026');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    const handleCustomizationChanged = () => {
      setContestType(localStorage.getItem('contestType') || 'Concurso Público');
      setContestNumber(localStorage.getItem('contestNumber') || '01/2026');
    };
    window.addEventListener('customizationChanged', handleCustomizationChanged);
    return () => window.removeEventListener('customizationChanged', handleCustomizationChanged);
  }, []);

  useEffect(() => {
    if (hideThemeToggle) {
      document.body.classList.remove('dark');
      return;
    }
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode, hideThemeToggle]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <header style={{ paddingTop: '0', paddingBottom: '0.5rem', textAlign: 'center', position: 'relative' }}>
      <div style={{ position: 'fixed', top: '1rem', right: '2rem', display: 'flex', gap: '1rem', zIndex: 10 }}>
        {!hideThemeToggle && (
          <button 
            onClick={toggleDarkMode}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)' }}
            title="Alternar Modo Escuro/Claro"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        )}
        <a 
          href="http://wa.me/5544999775500"
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)', display: 'flex', alignItems: 'center' }}
          title="Fale Conosco via WhatsApp"
        >
          <MessageSquare size={24} />
        </a>
      </div>
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="premium-logo-wrapper">
          <img src="/logo.png" alt="Prefeitura da Cidade de Terra Boa" style={{ height: '100px' }} />
        </div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '500', color: 'var(--primary-color)', marginBottom: '0' }}>Prefeitura Municipal de Terra Boa</h1>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-dark)', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
          {contestType} {contestNumber}
        </h2>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-gray)', lineHeight: '1.5' }}>
          <div>Estado do Paraná</div>
          <div>CNPJ 75.793.786/0001-40</div>
        </div>
      </div>
    </header>
  );
};
