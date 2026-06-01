import React, { useRef, useState, useMemo } from 'react';
import { User, Users, Printer, Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../../components/Button';
import { supabase } from '../../config/supabase';

export const SubscriberList = () => {

  const [sortConfig, setSortConfig] = useState({ key: 'dataHora', direction: 'desc' });
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

      <div className="no-print" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: '800', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} color="var(--primary-color)" /> Lista dos {subscribers.length} inscritos
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem', marginBottom: '0', fontWeight: '500' }}>{subscribers.length} registros encontrados</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#10b981'}}></div> Afrodescendente</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#3b82f6'}}></div> Lactante</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{width:'10px', height:'10px', borderRadius:'50%', backgroundColor:'#aa3bff'}}></div> PCD</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981' }}>
              <Download size={18} /> Exportar CSV
            </Button>
            <Button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={18} /> Imprimir Relatório
            </Button>
          </div>
        </div>
      </div>

      <div className="table-responsive">

          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
            <thead style={{ backgroundColor: '#f8fafc', color: 'var(--text-gray)' }}>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-dark)' }}>
                <th style={{ padding: '0.5rem 1rem', fontWeight: '500', width: '120px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onClick={() => requestSort('inscricao')}>
                      Inscrição {getSortIcon('inscricao')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onClick={() => requestSort('dataHora')}>
                      Data {getSortIcon('dataHora')}
                    </div>
                  </div>
                </th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: '500' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onClick={() => requestSort('name')}>
                      Nome {getSortIcon('name')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onClick={() => requestSort('cargo')}>
                      Cargo {getSortIcon('cargo')}
                    </div>
                  </div>
                </th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: '500', cursor: 'pointer' }} onClick={() => requestSort('cpf')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Documentos {getSortIcon('cpf')}</div>
                </th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: '500' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onClick={() => requestSort('nascimento')}>
                      Nascimento {getSortIcon('nascimento')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }} onClick={() => requestSort('idade')}>
                      Idade {getSortIcon('idade')}
                    </div>
                  </div>
                </th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: '500', cursor: 'pointer' }} onClick={() => requestSort('email')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Contato {getSortIcon('email')}</div>
                </th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: '500', cursor: 'pointer' }} onClick={() => requestSort('local')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Endereço Completo {getSortIcon('local')}</div>
                </th>
                <th style={{ padding: '0.5rem 1rem', fontWeight: '500' }}>Condições Especiais</th>
              </tr>
            </thead>
            <tbody>
              {sortedSubscribers.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-dark)' }}>
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <div style={{ fontWeight: 600 }}>{sub.inscricao}</div>
                    <div style={{ color: 'var(--text-gray)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                      {new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(sub.dataHora))}
                    </div>
                  </td>
                  <td style={{ padding: '0.5rem 1rem' }}>
                    <div>
                      <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{sub.name}</div>
                      <div style={{ whiteSpace: 'nowrap' }}>{sub.cargo}</div>
                    </div>
                  </td>
                  <td style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
                    <div>CPF: {sub.cpf}</div>
                    <div>RG: {sub.rg}</div>
                  </td>
                  <td style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
                    <div>{sub.nascimento}</div>
                    <div>{sub.idade} anos</div>
                  </td>
                  <td style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
                    <div>{sub.contato}</div>
                    <div>{sub.email}</div>
                  </td>
                  <td style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
                    <div>{sub.endereco}, {sub.numero || 'S/N'} - {sub.bairro}</div>
                    <div>{sub.local} - {sub.uf} | CEP: {sub.cep}</div>
                  </td>
                  <td style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {sub.afro ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{width:'8px', height:'8px', borderRadius:'50%', backgroundColor:'#10b981', flexShrink: 0}}></div> Afrodescendente</span> : null}
                      {sub.lact ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{width:'8px', height:'8px', borderRadius:'50%', backgroundColor:'#3b82f6', flexShrink: 0}}></div> Lactante</span> : null}
                      {sub.pcd ? <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{width:'8px', height:'8px', borderRadius:'50%', backgroundColor:'#aa3bff', flexShrink: 0}}></div> PCD</span> : null}
                      {!sub.afro && !sub.lact && !sub.pcd && <span>Nenhuma Especial</span>}
                      {sub.necessidade && sub.necessidade !== 'Nenhuma' && (
                        <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-gray)', whiteSpace: 'normal', maxWidth: '200px' }}>
                          <strong>Necessidade:</strong> {sub.necessidade}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};
