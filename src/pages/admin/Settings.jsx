import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Trash2, Briefcase, Settings as SettingsIcon, ShieldCheck, Edit2, Check, X, Database, Download, Upload, AlertTriangle } from 'lucide-react';
import { supabase } from '../../config/supabase';

export const Settings = () => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [cargos, setCargos] = useState([]);
  
  // Period states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isEditingPeriod, setIsEditingPeriod] = useState(false);
  
  // Customization
  const [contestType, setContestType] = useState('Concurso Público');
  const [contestNumber, setContestNumber] = useState('01/2026');
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  
  const [editingCargo, setEditingCargo] = useState(null);
  const [editValue, setEditValue] = useState('');

  // DB Management
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef(null);
  
  // Feedback Modal
  const [feedback, setFeedback] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  const showFeedback = (type, title, message) => {
    setFeedback({ isOpen: true, type, title, message });
  };

  // Default cargos if none exist
  const defaultCargos = [
    { value: 'cirurgiao', label: 'Cirurgião-dentista' },
    { value: 'enfermeiro', label: 'Enfermeiro' },
    { value: 'assistente', label: 'Assistente Social' },
    { value: 'tecnico', label: 'Técnico em Enfermagem' }
  ];

  // Helper to format date for display (Brasilia timezone)
  const formatDisplayDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
  };

  useEffect(() => {
    // Load Registration State
    const savedState = localStorage.getItem('isRegistrationOpen');
    if (savedState !== null) {
      setIsRegistrationOpen(savedState === 'true');
    }

    // Load Period
    const savedStart = localStorage.getItem('periodStartDate');
    const savedEnd = localStorage.getItem('periodEndDate');
    
    if (savedStart && savedEnd) {
      setStartDate(savedStart);
      setEndDate(savedEnd);
    } else {
      // Default period: Now to 7 days from now
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // format to YYYY-MM-DDTHH:mm
      const formatIso = (d) => new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      
      const defaultStart = formatIso(now);
      const defaultEnd = formatIso(nextWeek);
      
      setStartDate(defaultStart);
      setEndDate(defaultEnd);
      localStorage.setItem('periodStartDate', defaultStart);
      localStorage.setItem('periodEndDate', defaultEnd);
    }

    // Load Cargos
    const savedCargos = localStorage.getItem('jobOptions');
    if (savedCargos) {
      setCargos(JSON.parse(savedCargos));
    } else {
      setCargos(defaultCargos);
      localStorage.setItem('jobOptions', JSON.stringify(defaultCargos));
    }

    // Load Customization
    const savedType = localStorage.getItem('contestType');
    const savedNumber = localStorage.getItem('contestNumber');
    if (savedType) setContestType(savedType);
    if (savedNumber) setContestNumber(savedNumber);
  }, []);

  const toggleRegistration = () => {
    const newState = !isRegistrationOpen;
    setIsRegistrationOpen(newState);
    localStorage.setItem('isRegistrationOpen', String(newState));
  };
  
  const savePeriod = () => {
    localStorage.setItem('periodStartDate', startDate);
    localStorage.setItem('periodEndDate', endDate);
    setIsEditingPeriod(false);
  };

  const saveCustomization = () => {
    localStorage.setItem('contestType', contestType);
    localStorage.setItem('contestNumber', contestNumber);
    setIsSavingCustom(true);
    setTimeout(() => setIsSavingCustom(false), 2000);
    // Dispara evento para atualizar outros componentes se necessário
    window.dispatchEvent(new Event('customizationChanged'));
  };

  const handleAddCargo = () => {
    if (!newCargo.trim()) return;
    
    // Generate a simple value from the label
    const value = newCargo.toLowerCase().replace(/[^a-z0-9]/g, '');
    const updatedCargos = [...cargos, { value, label: newCargo.trim() }];
    
    setCargos(updatedCargos);
    localStorage.setItem('jobOptions', JSON.stringify(updatedCargos));
    setNewCargo('');
  };

  const handleDeleteCargo = (valueToRemove) => {
    const updatedCargos = cargos.filter(cargo => cargo.value !== valueToRemove);
    setCargos(updatedCargos);
    localStorage.setItem('jobOptions', JSON.stringify(updatedCargos));
  };

  const startEditing = (cargo) => {
    setEditingCargo(cargo.value);
    setEditValue(cargo.label);
  };

  const saveEdit = () => {
    if (!editValue.trim()) {
      // If it was a new unsaved row, remove it
      if (editingCargo.startsWith('temp_')) {
        setCargos(cargos.filter(c => c.value !== editingCargo));
      }
      setEditingCargo(null);
      return;
    }
    
    const updatedCargos = cargos.map(c => {
      if (c.value === editingCargo) {
        // If it was a temp ID, create a real value from the label
        const finalValue = editingCargo.startsWith('temp_') 
          ? editValue.toLowerCase().replace(/[^a-z0-9]/g, '') 
          : c.value;
        return { value: finalValue, label: editValue.trim() };
      }
      return c;
    });
    
    setCargos(updatedCargos);
    localStorage.setItem('jobOptions', JSON.stringify(updatedCargos));
    setEditingCargo(null);
  };

  const cancelEdit = () => {
    if (editingCargo && editingCargo.startsWith('temp_')) {
      setCargos(cargos.filter(c => c.value !== editingCargo));
    }
    setEditingCargo(null);
  };

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const { data, error } = await supabase.from('subscribers').select('*');
      if (error) throw error;
      
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-inscritos-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      showFeedback('error', 'Erro no Backup', 'Erro ao realizar backup do banco de dados.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    try {
      const text = await file.text();
      const parsedData = JSON.parse(text);
      
      if (!Array.isArray(parsedData)) {
        throw new Error('Formato de arquivo inválido. É esperado um array JSON.');
      }

      // Remove IDs if they exist to allow clean insert, or keep them if we want an exact restore
      // Supabase usually handles inserts with IDs if they match, but better to clear existing and restore
      const { error } = await supabase.from('subscribers').insert(parsedData);
      if (error) throw error;

      showFeedback('success', 'Restauração Concluída', `${parsedData.length} registros foram inseridos com sucesso no banco de dados.`);
    } catch (error) {
      console.error(error);
      showFeedback('error', 'Erro na Restauração', 'Erro ao restaurar banco de dados. O arquivo pode estar corrompido ou no formato incorreto.');
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDatabase = async () => {
    if (deleteConfirmation !== 'CONFIRMAR') return;
    
    setIsDeleting(true);
    try {
      // Supabase requires a filter to delete all rows. We use .not('id', 'is', null) which matches all rows.
      const { error } = await supabase.from('subscribers').delete().not('id', 'is', null);
      if (error) throw error;
      
      setIsDeleteModalOpen(false);
      setDeleteConfirmation('');
      showFeedback('success', 'Banco Apagado', 'Todos os registros foram apagados com sucesso!');
    } catch (error) {
      console.error(error);
      showFeedback('error', 'Erro ao Apagar', 'Ocorreu um erro ao tentar apagar o banco de dados.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Personalization Section */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '800', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SettingsIcon size={16} color="var(--primary-color)" /> Personalização do Certame
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#a0aec0', marginTop: '0.25rem', marginBottom: '1.5rem', fontWeight: '500' }}>
            Defina o tipo e número para personalizar os títulos e textos do portal.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 300px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Tipo (ex: Concurso Público, Processo Seletivo PSS)</label>
              <Input 
                value={contestType} 
                onChange={(e) => setContestType(e.target.value)}
                placeholder="Ex: Concurso Público"
                style={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Número/Ano (ex: 02/2026)</label>
              <Input 
                value={contestNumber} 
                onChange={(e) => setContestNumber(e.target.value)}
                placeholder="Ex: 02/2026"
                style={{ marginBottom: 0 }}
              />
            </div>
            <Button onClick={saveCustomization} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {isSavingCustom ? <><Check size={18} /> Salvo!</> : 'Salvar Alterações'}
            </Button>
          </div>
        </div>

        {/* Registration Access Control */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '800', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--primary-color)" /> Controle de Acesso
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#a0aec0', marginTop: '0.25rem', marginBottom: '1.5rem', fontWeight: '500' }}>
            Habilite ou desabilite o acesso ao formulário público de inscrição.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div 
              onClick={toggleRegistration}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div style={{ width: '40px', height: '24px', backgroundColor: isRegistrationOpen ? '#10b981' : '#ef4444', borderRadius: '12px', position: 'relative', transition: 'background-color 0.2s' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: isRegistrationOpen ? '18px' : '2px', transition: 'left 0.2s' }}></div>
              </div>
              <span style={{ color: isRegistrationOpen ? '#10b981' : '#ef4444', fontWeight: '500', fontSize: '0.875rem' }}>
                {isRegistrationOpen ? 'Inscrições Abertas' : 'Inscrições Bloqueadas'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
              <span>📅 Período:</span>
              {isEditingPeriod ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.875rem', fontFamily: 'inherit' }} />
                  <span style={{ color: 'var(--text-light)' }}>→</span>
                  <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.875rem', fontFamily: 'inherit' }} />
                  <button onClick={savePeriod} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '0.25rem' }} title="Salvar Período"><Check size={16} /></button>
                  <button onClick={() => setIsEditingPeriod(false)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem' }} title="Cancelar"><X size={16} /></button>
                </div>
              ) : (
                <>
                  <span style={{ fontWeight: '500' }}>{formatDisplayDate(startDate)}</span>
                  <span style={{ color: 'var(--text-light)' }}>→</span>
                  <span style={{ fontWeight: '500' }}>{formatDisplayDate(endDate)}</span>
                  <button onClick={() => setIsEditingPeriod(true)} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', cursor: 'pointer', padding: '0' }} title="Editar Período"><Edit2 size={14} /></button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Jobs Management */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '800', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={16} color="var(--primary-color)" /> Cargos Disponíveis
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#a0aec0', marginTop: '0.25rem', marginBottom: '0', fontWeight: '500' }}>
                Adicione ou remova os cargos que aparecerão na tela de Dados Pessoais do candidato.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <Button onClick={() => {
                const tempId = 'temp_' + Date.now();
                const newEmptyCargo = { value: tempId, label: '' };
                setCargos([newEmptyCargo, ...cargos]);
                setEditingCargo(tempId);
                setEditValue('');
              }} style={{ whiteSpace: 'nowrap' }}>+ Novo Cargo</Button>
            </div>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.875rem', color: 'var(--text-dark)' }}>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Nome do Cargo</th>
                  <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal', width: '100px', textAlign: 'center' }}>Ações</th>
                </tr>
            </thead>
            <tbody>
              {cargos.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                    Nenhum cargo cadastrado.
                  </td>
                </tr>
              ) : (
                cargos.map((cargo) => (
                  <tr key={cargo.value} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-dark)' }}>
                    <td style={{ padding: '0.5rem 1rem' }}>
                      {editingCargo === cargo.value ? (
                        <Input 
                          value={editValue} 
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                          style={{ marginBottom: 0, padding: '0.25rem 0.5rem', height: 'auto', minHeight: '32px' }}
                          autoFocus
                        />
                      ) : (
                        cargo.label
                      )}
                    </td>
                    <td style={{ padding: '0.5rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {editingCargo === cargo.value ? (
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                          <button 
                            onClick={saveEdit}
                            style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Salvar"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={cancelEdit}
                            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Cancelar"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                          <button 
                            onClick={() => startEditing(cargo)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0e7ff'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Editar Cargo"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCargo(cargo.value)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px', transition: 'background-color 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            title="Excluir Cargo"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Database Management */}
      <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: '1.5rem', border: '1px solid var(--border-color)', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: '800', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={16} color="var(--primary-color)" /> Gerenciamento do Banco de Dados
        </h3>
        <p style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem', marginBottom: '1.5rem', fontWeight: '500' }}>
          Opções avançadas de sistema. Cuidado ao utilizar a exclusão de dados.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Backup */}
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <Download size={32} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Backup de Inscritos</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>Baixa todos os registros da tabela em um arquivo JSON de segurança.</p>
            <Button onClick={handleBackup} disabled={isBackingUp} style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', border: 'none' }}>
              {isBackingUp ? 'Baixando...' : 'Fazer Backup'}
            </Button>
          </div>

          {/* Restore */}
          <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', backgroundColor: '#f8fafc' }}>
            <Upload size={32} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Restaurar Backup</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>Importa um arquivo JSON para dentro do banco de dados atual.</p>
            <input type="file" accept=".json" style={{ display: 'none' }} ref={fileInputRef} onChange={handleRestore} />
            <Button onClick={() => fileInputRef.current?.click()} disabled={isRestoring} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', border: 'none' }}>
              {isRestoring ? 'Restaurando...' : 'Selecionar Arquivo'}
            </Button>
          </div>

          {/* Danger Zone */}
          <div style={{ padding: '1.5rem', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', textAlign: 'center', backgroundColor: '#fef2f2' }}>
            <AlertTriangle size={32} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#b91c1c' }}>Zona de Perigo</h4>
            <p style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '1rem' }}>Apaga definitivamente todos os inscritos atuais do banco de dados.</p>
            <Button onClick={() => setIsDeleteModalOpen(true)} style={{ width: '100%', backgroundColor: '#ef4444', color: 'white', border: 'none' }}>
              Apagar Tudo
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', marginBottom: '1rem' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Atenção Máxima</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Esta ação <strong>apagará todos os inscritos</strong> da tabela. A recuperação só será possível se você tiver feito um backup prévio.
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-dark)', marginBottom: '1rem' }}>
              Para prosseguir, digite <strong>CONFIRMAR</strong> abaixo:
            </p>
            <Input 
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="CONFIRMAR"
              style={{ marginBottom: '1.5rem', border: '1px solid #ef4444' }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button onClick={() => { setIsDeleteModalOpen(false); setDeleteConfirmation(''); }} style={{ flex: 1, backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)', border: '1px solid var(--border-color)' }}>
                Cancelar
              </Button>
              <Button onClick={handleDeleteDatabase} disabled={deleteConfirmation !== 'CONFIRMAR' || isDeleting} style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none', opacity: deleteConfirmation === 'CONFIRMAR' ? 1 : 0.5 }}>
                {isDeleting ? 'Apagando...' : 'Apagar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedback.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: 'var(--shadow-lg)', animation: 'fadeIn 0.2s ease-out' }}>
            {feedback.type === 'success' ? (
              <Check size={48} color="var(--success-color)" style={{ margin: '0 auto 1rem' }} />
            ) : (
              <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
            )}
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>{feedback.title}</h3>
            <p style={{ color: 'var(--text-gray)', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: '1.5' }}>
              {feedback.message}
            </p>
            <Button variant="primary" style={{ width: '100%' }} onClick={() => setFeedback({ ...feedback, isOpen: false })}>
              OK
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};
