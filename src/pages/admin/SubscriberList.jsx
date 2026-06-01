import React, { useRef, useState, useMemo } from 'react';
import { User, Users, Printer, Download, ArrowUpDown, ArrowUp, ArrowDown, ChevronDown, ChevronUp, MapPin, Phone, Search } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { supabase } from '../../config/supabase';

export const SubscriberList = () => {

  const [sortConfig, setSortConfig] = useState({ key: 'dataHora', direction: 'desc' });
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  React.useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const { data, error } = await supabase.from('subscribers').select('*');
        if (error) throw error;
        setSubscribers(data || []);
      } catch (err) {
        console.error('Erro ao buscar inscritos:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  const sortedSubscribers = useMemo(() => {
    let sortableItems = [...subscribers];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'dataHora') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (sortConfig.key === 'nascimento') {
          const [dayA, monthA, yearA] = aVal.split('/');
          const [dayB, monthB, yearB] = bVal.split('/');
          aVal = new Date(`${yearA}-${monthA}-${dayA}`).getTime();
          bVal = new Date(`${yearB}-${monthB}-${dayB}`).getTime();
        }
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [sortConfig, subscribers]);

  const filteredSubscribers = useMemo(() => {
    return sortedSubscribers.filter(sub => {
      const term = searchTerm.toLowerCase();
      return sub.name.toLowerCase().includes(term) || sub.inscricao.toLowerCase().includes(term);
    });
  }, [sortedSubscribers, searchTerm]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };
  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Inscrição', 'Nome', 'Cargo', 'CPF', 'RG', 'Nascimento', 'Idade', 'Contato', 'Email', 'Local', 'UF', 'CEP', 'Endereço', 'Número', 'Bairro', 'Condições Especiais', 'Necessidade'];
    
    const rows = subscribers.map(sub => {
      const condicoes = [];
      if (sub.afro) condicoes.push('Afrodescendente');
      if (sub.lact) condicoes.push('Lactante');
      if (sub.pcd) condicoes.push('PCD');
      if (condicoes.length === 0) condicoes.push('Nenhuma');
      
      return [
        sub.inscricao,
        `"${sub.name}"`,
        `"${sub.cargo}"`,
        sub.cpf,
        sub.rg,
        sub.nascimento,
        sub.idade,
        `"${sub.contato}"`,
        sub.email,
        `"${sub.local}"`,
        sub.uf,
        sub.cep,
        `"${sub.endereco}"`,
        `"${sub.numero || ''}"`,
        `"${sub.bairro}"`,
        `"${condicoes.join(', ')}"`,
        `"${sub.necessidade || 'Nenhuma'}"`
      ].join(';');
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inscritos_concurso_02_2026.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0' }}>Carregando lista de inscritos...</div>;
  }

  return (
    <div className="print-container" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Cabeçalho de Impressão */}
      <div className="print-header" style={{ display: 'none', alignItems: 'center', gap: '1.5rem', padding: '1.5rem', borderBottom: '2px solid var(--border-color)' }}>
        <img src="/logo.png" alt="Prefeitura" style={{ height: '60px' }} />
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-dark)', margin: 0 }}>
            {localStorage.getItem('contestType') || 'Concurso Público'} {localStorage.getItem('contestNumber') || '01/2026'}
          </h1>
          <h2 style={{ fontSize: '1rem', color: 'var(--text-gray)', margin: '0.25rem 0 0 0' }}>Lista dos {subscribers.length} inscritos</h2>
        </div>
      </div>

      <div className="no-print" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Linha Superior: Título e Ações */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '0.875rem', fontWeight: '800', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} color="var(--primary-color)" /> Lista dos {filteredSubscribers.length} inscritos
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem', marginBottom: '0', fontWeight: '500' }}>{filteredSubscribers.length} registros encontrados</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="var(--text-gray)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                className="input-field"
                placeholder="Buscar por código ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '280px', margin: 0 }}
              />
            </div>
            <Button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981' }}>
              <Download size={18} /> Exportar CSV
            </Button>
            <Button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={18} /> Imprimir Relatório
            </Button>
          </div>
        </div>

        {/* Linha Inferior: Legendas */}
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-gray)', fontWeight: '500', alignItems: 'center' }}>
          <span style={{ color: '#a0aec0', marginRight: '-0.5rem' }}>Legenda:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#10b981'}}></div> Afrodescendente
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#3b82f6'}}></div> Lactante
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#aa3bff'}}></div> PCD
          </div>
        </div>
      </div>

      <div className="table-responsive" style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
        
        {/* Header Visual */}
        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '100px 3fr 2fr 2fr 2fr 50px', gap: '1rem', padding: '1rem', color: 'var(--text-gray)', fontSize: '0.875rem', fontWeight: '500', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => requestSort('inscricao')}>
            Código {getSortIcon('inscricao')}
          </div>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => requestSort('name')}>
            Nome/Cargo {getSortIcon('name')}
          </div>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => requestSort('contato')}>
            Contato {getSortIcon('contato')}
          </div>
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => requestSort('local')}>
            Localização {getSortIcon('local')}
          </div>
          <div>Condições Especiais</div>
          <div></div>
        </div>

        {/* Linhas (Cards) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredSubscribers.map((sub) => (
            <div key={sub.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', backgroundColor: 'white', transition: 'box-shadow 0.2s', boxShadow: expandedRow === sub.id ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}>
              
              {/* Linha Resumo (Sempre Visível) */}
              <div 
                onClick={() => toggleRow(sub.id)}
                style={{ display: 'grid', gridTemplateColumns: '100px 3fr 2fr 2fr 2fr 50px', gap: '1rem', padding: '1rem', alignItems: 'center', cursor: 'pointer', backgroundColor: expandedRow === sub.id ? '#f8fafc' : 'transparent' }}
              >
                {/* Código */}
                <div style={{ fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.875rem' }}>
                  {sub.inscricao}
                </div>

                {/* Nome/Cargo */}
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.875rem' }}>{sub.name}</div>
                  <div style={{ color: 'var(--text-gray)', fontSize: '0.75rem', marginTop: '0.125rem' }}>{sub.cargo}</div>
                </div>

                {/* Contato */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontSize: '0.875rem' }}>
                  <Phone size={14} color="var(--text-gray)" />
                  {sub.contato}
                </div>

                {/* Localização */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-dark)', fontSize: '0.875rem' }}>
                    <MapPin size={14} color="var(--text-gray)" />
                    {sub.local}
                  </div>
                  <div style={{ color: 'var(--text-gray)', fontSize: '0.75rem', marginTop: '0.125rem', marginLeft: '1.25rem' }}>
                    CEP: {sub.cep}
                  </div>
                </div>

                {/* Condições Especiais */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: sub.afro ? '#dcfce7' : '#f1f5f9', color: sub.afro ? '#166534' : '#64748b', fontWeight: '500' }}>
                    {sub.afro ? 'Afro' : 'Não'}
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: sub.lact ? '#dbeafe' : '#f1f5f9', color: sub.lact ? '#1e40af' : '#64748b', fontWeight: '500' }}>
                    {sub.lact ? 'Lact.' : 'Não'}
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '1rem', backgroundColor: sub.pcd ? '#f3e8ff' : '#f1f5f9', color: sub.pcd ? '#6b21a8' : '#64748b', fontWeight: '500' }}>
                    {sub.pcd ? 'PCD' : 'Não'}
                  </span>
                </div>

                {/* Expandir */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', color: 'var(--text-gray)' }}>
                  {expandedRow === sub.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {/* Área Expandida (Detalhes) */}
              {expandedRow === sub.id && (
                <div style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem', backgroundColor: 'white', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                  
                  {/* Dados Pessoais */}
                  <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '1rem' }}>
                      <User size={16} /> Dados Pessoais
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-gray)' }}>
                      <div><strong style={{ color: 'var(--text-dark)' }}>Inscrição:</strong> {sub.inscricao} ({new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(sub.dataHora))})</div>
                      <div><strong style={{ color: 'var(--text-dark)' }}>CPF:</strong> {sub.cpf}</div>
                      <div><strong style={{ color: 'var(--text-dark)' }}>RG:</strong> {sub.rg}</div>
                      <div><strong style={{ color: 'var(--text-dark)' }}>Nascimento:</strong> {sub.nascimento}</div>
                      {sub.necessidade && sub.necessidade !== 'Nenhuma' && (
                        <div style={{ marginTop: '0.5rem' }}><strong style={{ color: 'var(--text-dark)' }}>Necessidade Especial:</strong> {sub.necessidade}</div>
                      )}
                    </div>
                  </div>

                  {/* Contato */}
                  <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '1rem' }}>
                      <Phone size={16} /> Contato
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-gray)' }}>
                      <div><strong style={{ color: 'var(--text-dark)' }}>Telefone:</strong> {sub.contato}</div>
                      <div><strong style={{ color: 'var(--text-dark)' }}>E-mail:</strong> {sub.email}</div>
                      <div><strong style={{ color: 'var(--text-dark)' }}>Endereço:</strong> {sub.endereco}, {sub.numero || 'S/N'}</div>
                    </div>
                  </div>

                  {/* Localização */}
                  <div>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '1rem' }}>
                      <MapPin size={16} /> Localização
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-gray)' }}>
                      <div><strong style={{ color: 'var(--text-dark)' }}>CEP:</strong> {sub.cep}</div>
                      <div><strong style={{ color: 'var(--text-dark)' }}>Bairro:</strong> {sub.bairro}</div>
                      <div><strong style={{ color: 'var(--text-dark)' }}>Cidade:</strong> {sub.local} - {sub.uf}</div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          ))}
          {filteredSubscribers.length === 0 && (
             <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-gray)', fontSize: '0.875rem' }}>
               Nenhum inscrito encontrado.
             </div>
          )}
        </div>

      </div>
    </div>
  );
};
