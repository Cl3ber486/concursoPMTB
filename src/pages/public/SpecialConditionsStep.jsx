import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Select } from '../../components/Select';
import { Radio } from '../../components/Radio';
import { Button } from '../../components/Button';
import { RegistrationIdBanner } from '../../components/RegistrationIdBanner';

export const SpecialConditionsStep = () => {
  const navigate = useNavigate();
  const [afro, setAfro] = useState(() => sessionStorage.getItem('sc_afro') || 'nao');
  const [lactante, setLactante] = useState(() => sessionStorage.getItem('sc_lactante') || 'nao');
  const [pcd, setPcd] = useState(() => sessionStorage.getItem('sc_pcd') || '');
  const [necessidade, setNecessidade] = useState(() => sessionStorage.getItem('sc_necessidade') || '');

  useEffect(() => {
    sessionStorage.setItem('sc_afro', afro);
    sessionStorage.setItem('sc_lactante', lactante);
    sessionStorage.setItem('sc_pcd', pcd);
    sessionStorage.setItem('sc_necessidade', necessidade);
  }, [afro, lactante, pcd, necessidade]);

  const pcdOptions = [
    { value: '', label: 'Nenhuma' },
    { value: 'auditiva', label: 'Deficiência auditiva' },
    { value: 'visual', label: 'Deficiência visual' },
    { value: 'fisica', label: 'Deficiência física' }
  ];

  const radioOptions = [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ];

  return (
    <Card>
      <RegistrationIdBanner />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--bg-main)' }}>
          <Radio label="Afrodescendente" name="afro" options={radioOptions} value={afro} onChange={e => setAfro(e.target.value)} />
        </div>
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--bg-main)' }}>
          <Radio label="Lactante" name="lactante" options={radioOptions} value={lactante} onChange={e => setLactante(e.target.value)} />
        </div>
      </div>

      <Select label="Pessoa com Deficiência (PCD)" id="pcd" options={pcdOptions} value={pcd} onChange={(e) => setPcd(e.target.value)} />

      <div className="input-group">
        <label htmlFor="necessidade" className="input-label">Há necessidade de alguma condição especial para a realização da prova?</label>
        <textarea id="necessidade" className="input-field" rows="4" placeholder="Descreva aqui se necessário..." value={necessidade} onChange={(e) => setNecessidade(e.target.value)} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          &lt; Voltar
        </Button>
        <Button onClick={() => navigate('/inscricao/revisao')}>
          Continuar &gt;
        </Button>
      </div>
    </Card>
  );
};
