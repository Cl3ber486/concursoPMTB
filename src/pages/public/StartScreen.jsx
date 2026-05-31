import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { CheckCircle, XCircle } from 'lucide-react';

export const StartScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [periodText, setPeriodText] = useState('');
  const isConfirmed = location.state?.confirmed;

  useEffect(() => {
    // Check manual override
    const savedState = localStorage.getItem('isRegistrationOpen');
    const isManualOpen = savedState === null || savedState === 'true';

    // Check period
    const savedStart = localStorage.getItem('periodStartDate');
    const savedEnd = localStorage.getItem('periodEndDate');

    let inPeriod = true;
    
    if (savedStart && savedEnd) {
      const formatDisplayDate = (isoString) => {
        if (!isoString) return '';
        const dateObj = new Date(isoString);
        return dateObj.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
      };
      setPeriodText(`Período das Inscrições: ${formatDisplayDate(savedStart)} até ${formatDisplayDate(savedEnd)}`);

      // Get current time in Brasilia
      const date = new Date();
      const options = { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
      const formatter = new Intl.DateTimeFormat('pt-BR', options);
      const parts = formatter.formatToParts(date);
      const map = {};
      parts.forEach(p => map[p.type] = p.value);
      
      const brasiliaNow = `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
      
      inPeriod = brasiliaNow >= savedStart && brasiliaNow <= savedEnd;
    }

    setIsOpen(isManualOpen && inPeriod);
  }, []);

  useEffect(() => {
    if (isConfirmed) {
      // Limpa o state do histórico para que ao atualizar a página (F5) a mensagem não apareça novamente
      window.history.replaceState({}, document.title);
    }
  }, [isConfirmed]);

  return (
    <Card className="text-center">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        {isOpen ? (
          <CheckCircle size={64} color="var(--success-color)" />
        ) : (
          <XCircle size={64} color="#ef4444" />
        )}
      </div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>
        {isConfirmed ? 'Inscrição Confirmada 👍' : (isOpen ? 'Inscrições Abertas!' : 'Inscrições Encerradas')}
      </h2>
      <p style={{ color: 'var(--text-gray)', marginBottom: '2rem', lineHeight: '1.5' }}>
        {isConfirmed 
          ? 'Sua inscrição foi recebida e confirmada com sucesso! Caso deseje, você pode realizar uma nova inscrição clicando no botão abaixo.'
          : (isOpen 
            ? 'O processo seletivo está com inscrições abertas. Clique no botão abaixo para iniciar sua inscrição.' 
            : `O período de inscrições para este ${(localStorage.getItem('contestType') || 'Concurso Público').toLowerCase()} foi encerrado.`)
        }
        {!isOpen && periodText && (
          <div style={{ marginTop: '2.5rem', padding: '1.2rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1.15rem', fontWeight: '600', color: '#0f172a' }}>
            {periodText}
          </div>
        )}
      </p>
      {isOpen && (
        <Button onClick={() => {
          sessionStorage.clear();
          navigate('/inscricao/dados-pessoais');
        }} style={{ width: '100%' }}>
          Iniciar Inscrição
        </Button>
      )}
    </Card>
  );
};
