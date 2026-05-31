import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { RegistrationIdBanner } from '../../components/RegistrationIdBanner';

export const AddressStep = () => {
  const navigate = useNavigate();
  const [cep, setCep] = useState(() => sessionStorage.getItem('ad_cep') || '');
  const [endereco, setEndereco] = useState(() => sessionStorage.getItem('ad_endereco') || '');
  const [numero, setNumero] = useState(() => sessionStorage.getItem('ad_numero') || '');
  const [bairro, setBairro] = useState(() => sessionStorage.getItem('ad_bairro') || '');
  const [cidade, setCidade] = useState(() => sessionStorage.getItem('ad_cidade') || '');
  const [telefone, setTelefone] = useState(() => sessionStorage.getItem('ad_telefone') || '');
  const [email, setEmail] = useState(() => sessionStorage.getItem('ad_email') || '');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    sessionStorage.setItem('ad_cep', cep);
    sessionStorage.setItem('ad_endereco', endereco);
    sessionStorage.setItem('ad_numero', numero);
    sessionStorage.setItem('ad_bairro', bairro);
    sessionStorage.setItem('ad_cidade', cidade);
    sessionStorage.setItem('ad_telefone', telefone);
    sessionStorage.setItem('ad_email', email);
  }, [cep, endereco, numero, bairro, cidade, telefone, email]);

  const formatText = (text) => {
    const prepositions = ['de', 'da', 'do', 'das', 'dos', 'e'];
    return text
      .split(' ')
      .map((word, index) => {
        if (!word) return '';
        const lowerWord = word.toLowerCase();
        if (prepositions.includes(lowerWord) && index !== 0) {
          return lowerWord;
        }
        return word.charAt(0).toUpperCase() + lowerWord.slice(1);
      })
      .join(' ');
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    let formatted = value;
    if (value.length > 5) {
      formatted = value.replace(/(\d{5})(\d{1,3})/, "$1-$2");
    }
    setCep(formatted);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    let formatted = value;
    if (value.length > 10) {
      formatted = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (value.length > 6) {
      formatted = value.replace(/(\d{2})(\d{4,5})(\d{0,4})/, "($1) $2-$3");
    } else if (value.length > 2) {
      formatted = value.replace(/(\d{2})(\d{1,5})/, "($1) $2");
    } else if (value.length > 0) {
      formatted = value.replace(/(\d{1,2})/, "($1");
    }
    setTelefone(formatted);
  };

  const handleNext = () => {
    setFormError('');
    const requiredFields = [
      { id: 'cep', value: cep },
      { id: 'endereco', value: endereco },
      { id: 'numero', value: numero },
      { id: 'bairro', value: bairro },
      { id: 'cidade', value: cidade },
      { id: 'telefone', value: telefone },
      { id: 'email', value: email }
    ];
    for (const field of requiredFields) {
      if (!field.value || !field.value.trim()) {
        setFormError('Por favor, preencha todos os campos obrigatórios (*).');
        document.getElementById(field.id)?.focus();
        return;
      }
    }
    navigate('/inscricao/condicoes-especiais');
  };

  return (
    <Card>
      <RegistrationIdBanner />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
        <Input 
          label="CEP *" 
          id="cep" 
          placeholder="00000-000" 
          value={cep}
          onChange={handleCepChange}
        />
        <Input label="Endereço *" id="endereco" placeholder="" value={endereco} onChange={(e) => setEndereco(formatText(e.target.value))} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem' }}>
        <Input label="Número *" id="numero" placeholder="" value={numero} onChange={(e) => setNumero(e.target.value)} />
        <Input label="Bairro *" id="bairro" placeholder="" value={bairro} onChange={(e) => setBairro(formatText(e.target.value))} />
        <Input label="Cidade *" id="cidade" placeholder="" value={cidade} onChange={(e) => setCidade(formatText(e.target.value))} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Input 
          label="DDD e Telefone *" 
          id="telefone" 
          placeholder="(00) 00000-0000" 
          value={telefone}
          onChange={handlePhoneChange}
        />
        <Input label="E-mail *" id="email" placeholder="seu@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} />
      </div>

      {formError && (
        <div className="error-message">
          {formError}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          &lt; Voltar
        </Button>
        <Button onClick={handleNext}>
          Continuar &gt;
        </Button>
      </div>
    </Card>
  );
};
