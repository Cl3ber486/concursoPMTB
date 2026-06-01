import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { CheckCircle, User, MapPin, AlertCircle } from 'lucide-react';
import { RegistrationIdBanner } from '../../components/RegistrationIdBanner';
import { supabase } from '../../config/supabase';

export const ReviewStep = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  
  // Load data from session storage
  const cargoOptions = JSON.parse(localStorage.getItem('jobOptions')) || [
    { value: 'cirurgiao', label: 'Cirurgião-dentista' },
    { value: 'enfermeiro', label: 'Enfermeiro' },
    { value: 'assistente', label: 'Assistente Social' },
    { value: 'tecnico', label: 'Técnico em Enfermagem' }
  ];
  const pd_cargo_val = sessionStorage.getItem('pd_cargo') || '';
  const pd_cargo = cargoOptions.find(opt => opt.value === pd_cargo_val)?.label || pd_cargo_val || 'Não informado';
  const pd_nome = sessionStorage.getItem('pd_nome') || 'Não informado';
  const pd_dataNasc = sessionStorage.getItem('pd_dataNasc') || 'Não informado';
  const pd_cpf = sessionStorage.getItem('pd_cpf') || 'Não informado';
  
  const ad_cep = sessionStorage.getItem('ad_cep') || 'Não informado';
  const ad_endereco = sessionStorage.getItem('ad_endereco') || 'Não informado';
  const ad_numero = sessionStorage.getItem('ad_numero') || 'Não informado';
  const ad_bairro = sessionStorage.getItem('ad_bairro') || 'Não informado';
  const ad_cidade = sessionStorage.getItem('ad_cidade') || 'Não informado';
  const ad_telefone = sessionStorage.getItem('ad_telefone') || 'Não informado';
  const ad_email = sessionStorage.getItem('ad_email') || 'Não informado';

  const sc_afro = sessionStorage.getItem('sc_afro') === 'sim' ? 'Sim' : 'Não';
  const sc_lactante = sessionStorage.getItem('sc_lactante') === 'sim' ? 'Sim' : 'Não';
  
  const pcdOptionsMap = {
    '': 'Nenhuma',
    'auditiva': 'Deficiência auditiva',
    'visual': 'Deficiência visual',
    'fisica': 'Deficiência física'
  };
  const sc_pcd_val = sessionStorage.getItem('sc_pcd') || '';
  const sc_pcd = pcdOptionsMap[sc_pcd_val] || 'Não';
  
  const sc_necessidade = sessionStorage.getItem('sc_necessidade') || 'Nenhuma';

  useEffect(() => {
    setRegistrationId(sessionStorage.getItem('registrationId') || '-----');
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      let idade = null;
      if (pd_dataNasc && pd_dataNasc !== 'Não informado') {
        const parts = pd_dataNasc.split('/');
        if (parts.length === 3) {
          const birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          const today = new Date();
          idade = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            idade--;
          }
        }
      }

      const { error } = await supabase
        .from('subscribers')
        .insert([
          {
            inscricao: registrationId,
            name: pd_nome,
            cargo: pd_cargo,
            cpf: pd_cpf,
            rg: sessionStorage.getItem('pd_rg') || 'Não informado',
            nascimento: pd_dataNasc,
            contato: ad_telefone,
            email: ad_email,
            idade: idade,
            local: ad_cidade,
            cep: ad_cep,
            endereco: ad_endereco,
            numero: ad_numero,
            bairro: ad_bairro,
            uf: sessionStorage.getItem('ad_uf') || 'PR',
            afro: sessionStorage.getItem('sc_afro') === 'sim',
            lact: sessionStorage.getItem('sc_lactante') === 'sim',
            pcd: sc_pcd,
            necessidade: sc_necessidade
          }
        ]);

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      setShowModal(true);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      alert('Erro ao confirmar inscrição. Tente novamente mais tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <RegistrationIdBanner />
      <div className="text-center" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <AlertCircle size={48} color="#f97316" />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>
          Confirmação de Dados
        </h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: '0.5rem' }}>
          Revise cuidadosamente antes de enviar sua inscrição
        </p>
        <p style={{ color: '#f97316', fontWeight: 'bold', fontSize: '0.9rem' }}>
          Atenção: Os dados não poderão ser alterados após a confirmação!
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-dark)' }}>Dados Pessoais</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>Cargo Pretendido</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{pd_cargo}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>Nome Completo</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{pd_nome}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>Data de Nascimento</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{pd_dataNasc}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>CPF</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{pd_cpf}</div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={18} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-dark)' }}>Endereço e Contato</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>CEP</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{ad_cep}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>Endereço</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{ad_endereco}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>Número</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{ad_numero}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>Bairro</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{ad_bairro}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>Cidade</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{ad_cidade}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>Telefone</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{ad_telefone}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>E-mail</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{ad_email}</div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={18} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-dark)' }}>Condições Especiais</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>Afrodescendente?</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{sc_afro}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>Lactante?</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{sc_lactante}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>Pessoa com Deficiência (PcD)</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{sc_pcd}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '0.25rem' }}>Necessita de condição especial para a prova?</div>
            <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-dark)' }}>{sc_necessidade}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
        <Button variant="secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
          &lt; Voltar
        </Button>
        <Button variant="success" onClick={handleConfirm} disabled={isSubmitting} style={{ gap: '0.5rem' }}>
          <CheckCircle size={18} color="#fff" />
          {isSubmitting ? 'Confirmando...' : 'Confirmar Inscrição'}
        </Button>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2.5rem 2rem', borderRadius: 'var(--radius-lg)', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.2s ease-out' }}>
            <CheckCircle size={64} color="var(--success-color)" style={{ margin: '0 auto 1.25rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Inscrição Confirmada!</h2>
            
            <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '1.5rem 0', border: '1px solid #bbf7d0' }}>
              <p style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.5rem', fontWeight: '500' }}>Anote seu número de identificação:</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#15803d', letterSpacing: '4px' }}>{registrationId}</div>
            </div>

            <p style={{ color: 'var(--text-gray)', marginBottom: '2rem', lineHeight: '1.5', fontSize: '0.875rem' }}>
              Os dados e este número de identificação foram enviados para o seu e-mail. Boa sorte no {(localStorage.getItem('contestType') || 'concurso').toLowerCase()}!
            </p>
            <Button variant="primary" style={{ width: '100%' }} onClick={() => navigate('/', { state: { confirmed: true } })}>
              Voltar ao Início
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
