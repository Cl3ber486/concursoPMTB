import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { RegistrationIdBanner } from '../../components/RegistrationIdBanner';
import { supabase } from '../../config/supabase';

export const PersonalDataStep = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [cpf, setCpf] = useState(() => sessionStorage.getItem('pd_cpf') || '');
  const [rg, setRg] = useState(() => sessionStorage.getItem('pd_rg') || '');
  const [nome, setNome] = useState(() => sessionStorage.getItem('pd_nome') || '');
  const [dataNasc, setDataNasc] = useState(() => sessionStorage.getItem('pd_dataNasc') || '');
  const [cargo, setCargo] = useState(() => sessionStorage.getItem('pd_cargo') || '');
  const [cpfError, setCpfError] = useState('');
  const [formError, setFormError] = useState('');

  const [cargoOptions, setCargoOptions] = React.useState([
    { value: 'cirurgiao', label: 'Cirurgião-dentista' },
    { value: 'enfermeiro', label: 'Enfermeiro' },
    { value: 'assistente', label: 'Assistente Social' },
    { value: 'tecnico', label: 'Técnico em Enfermagem' }
  ]);

  useEffect(() => {
    const savedCargos = localStorage.getItem('jobOptions');
    if (savedCargos) {
      const parsed = JSON.parse(savedCargos);
      setCargoOptions(parsed);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('pd_cpf', cpf);
    sessionStorage.setItem('pd_rg', rg);
    sessionStorage.setItem('pd_nome', nome);
    sessionStorage.setItem('pd_dataNasc', dataNasc);
    sessionStorage.setItem('pd_cargo', cargo);
  }, [cpf, rg, nome, dataNasc, cargo]);

  const formatName = (text) => {
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

  const handleCpfChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    let formatted = value;
    if (value.length > 9) {
      formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      formatted = value.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      formatted = value.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    }
    setCpf(formatted);
    if (cpfError) setCpfError('');
  };

  const validateCpf = (strCPF) => {
    let Soma = 0;
    let Resto;
    strCPF = strCPF.replace(/\D/g, '');
    if (strCPF == "00000000000" || strCPF.length !== 11) return false;
    
    for (let i=1; i<=9; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (11 - i);
    Resto = (Soma * 10) % 11;
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10)) ) return false;
    
    Soma = 0;
    for (let i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    Resto = (Soma * 10) % 11;
    if ((Resto == 10) || (Resto == 11))  Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11) ) ) return false;
    return true;
  };

  const handleNext = async () => {
    setFormError('');
    
    if (!cargo) { setFormError('Por favor, preencha todos os campos obrigatórios (*).'); document.getElementById('cargo')?.focus(); return; }
    if (!nome.trim()) { setFormError('Por favor, preencha todos os campos obrigatórios (*).'); document.getElementById('nome')?.focus(); return; }
    if (!dataNasc) { setFormError('Por favor, preencha todos os campos obrigatórios (*).'); document.getElementById('dataNasc')?.focus(); return; }
    if (!cpf) { setFormError('Por favor, preencha todos os campos obrigatórios (*).'); document.getElementById('cpf')?.focus(); return; }
    if (!rg.trim()) { setFormError('Por favor, preencha todos os campos obrigatórios (*).'); document.getElementById('rg')?.focus(); return; }
    
    if (!validateCpf(cpf)) {
      setCpfError('CPF inválido');
      document.getElementById('cpf')?.focus();
      return;
    }

    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('cpf')
        .eq('cpf', cpf)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setCpfError('Este CPF já está cadastrado no sistema.');
        document.getElementById('cpf')?.focus();
        return;
      }
      
      navigate('/inscricao/endereco');
    } catch (err) {
      console.error(err);
      setFormError('Erro ao verificar CPF no banco de dados. Tente novamente.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card>
      <RegistrationIdBanner />

      <Select 
        label="Cargo Pretendido *" 
        id="cargo" 
        options={cargoOptions} 
        value={cargo}
        onChange={(e) => setCargo(e.target.value)}
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Input 
          label="Nome Completo *" 
          id="nome" 
          placeholder="Digite seu nome completo" 
          value={nome}
          onChange={(e) => setNome(formatName(e.target.value))}
        />
        <Input 
          label="Data de Nascimento *" 
          id="dataNasc" 
          type="date" 
          value={dataNasc}
          onChange={(e) => setDataNasc(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
        <div>
          <Input 
            label="CPF *" 
            id="cpf" 
            placeholder="___.___.___-__" 
            value={cpf} 
            onChange={handleCpfChange} 
            style={{ borderColor: cpfError ? '#ef4444' : undefined }}
          />
          {cpfError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>{cpfError}</div>}
        </div>
        <Input 
          label="RG *" 
          id="rg" 
          placeholder="Apenas números e letras" 
          value={rg} 
          onChange={(e) => setRg(e.target.value.replace(/[^\w.-]/g, ''))} 
        />
      </div>

      {formError && (
        <div className="error-message">
          {formError}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <Button onClick={handleNext} disabled={isChecking}>
          {isChecking ? 'Verificando...' : 'Continuar >'}
        </Button>
      </div>
    </Card>
  );
};
