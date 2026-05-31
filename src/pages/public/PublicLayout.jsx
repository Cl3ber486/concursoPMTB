import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../../components/Header';

export const PublicLayout = () => {
  useEffect(() => {
    const contestType = localStorage.getItem('contestType') || 'Concurso Público';
    const contestNumber = localStorage.getItem('contestNumber') || '01/2026';
    document.title = `Inscrição - ${contestType} ${contestNumber}`;

    const handleCustomizationChanged = () => {
      const type = localStorage.getItem('contestType') || 'Concurso Público';
      const number = localStorage.getItem('contestNumber') || '01/2026';
      document.title = `Inscrição - ${type} ${number}`;
    };
    window.addEventListener('customizationChanged', handleCustomizationChanged);
    return () => window.removeEventListener('customizationChanged', handleCustomizationChanged);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0.5rem 2rem 2rem 2rem' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '0.5rem' }}>
        <Outlet />
      </main>
      <footer style={{ paddingTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
        <a href="https://www.terraboa.pr.gov.br" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color, #2563eb)', textDecoration: 'none', fontWeight: '500' }}>
          www.terraboa.pr.gov.br
        </a>
      </footer>
    </div>
  );
};
