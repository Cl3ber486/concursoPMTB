import React, { useState, useEffect } from 'react';
import { FileText, Users, LayoutDashboard, Printer, ArrowLeft } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { Button } from '../../components/Button';

export const Reports = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeReport, setActiveReport] = useState(null);

  useEffect(() => {
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

  const handlePrint = () => {
    window.print();
  };

  // Funções para cálculos do Dashboard
  const getDashboardData = () => {
    const total = subscribers.length;
    
    // Cargos
    const cargosCount = subscribers.reduce((acc, sub) => {
      acc[sub.cargo] = (acc[sub.cargo] || 0) + 1;
      return acc;
    }, {});

    // Cidades
    const cidadesCount = subscribers.reduce((acc, sub) => {
      acc[sub.local] = (acc[sub.local] || 0) + 1;
      return acc;
    }, {});

    // Cotas
    let pcdCount = 0;
    let afroCount = 0;
    let lactCount = 0;
    let pcdTypes = {};

    subscribers.forEach(sub => {
      if (sub.pcd && sub.pcd !== 'Nenhuma') {
        pcdCount++;
        pcdTypes[sub.pcd] = (pcdTypes[sub.pcd] || 0) + 1;
      }
      if (sub.afro) afroCount++;
      if (sub.lact) lactCount++;
    });

    return { total, cargosCount, cidadesCount, pcdCount, afroCount, lactCount, pcdTypes };
  };



  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      .print-area, .print-area * {
        visibility: visible;
      }
      .print-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        min-height: auto !important;
      }
      .no-print {
        display: none !important;
      }
      @page {
        margin: 1cm;
        size: ${activeReport === 'completo' ? 'landscape' : 'portrait'};
      }
    }
  `;

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0' }}>Carregando dados...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <style>{printStyles}</style>

      {/* TELA DE SELEÇÃO DE RELATÓRIO */}
      {!activeReport && (
        <div className="no-print" style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '800', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={16} color="var(--primary-color)" /> Central de Relatórios
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem', marginBottom: '1.5rem', fontWeight: '500' }}>
            Selecione o formato de relatório que deseja visualizar e imprimir.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <Users size={32} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Inscritos Otimizado</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>Formato em lista simplificada. Ideal para gastar menos papel (Retrato).</p>
              <Button onClick={() => setActiveReport('otimizado')} style={{ width: '100%', backgroundColor: '#3b82f6', color: 'white', border: 'none' }}>
                Gerar Relatório
              </Button>
            </div>

            <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <FileText size={32} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Inscritos Completo</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>Tabela com todos os dados cadastrais (Força impressão em Paisagem).</p>
              <Button onClick={() => setActiveReport('completo')} style={{ width: '100%', backgroundColor: '#10b981', color: 'white', border: 'none' }}>
                Gerar Relatório
              </Button>
            </div>

            <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <LayoutDashboard size={32} color="#f59e0b" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Resumo Executivo (Dashboard)</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-gray)', marginBottom: '1rem' }}>Estatísticas e totais gerais do concurso em formato de texto.</p>
              <Button onClick={() => setActiveReport('dashboard')} style={{ width: '100%', backgroundColor: '#f59e0b', color: 'white', border: 'none' }}>
                Gerar Relatório
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ÁREA DE EXIBIÇÃO DO RELATÓRIO SELECIONADO */}
      {activeReport && (
        <div>
          <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', backgroundColor: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Button onClick={() => setActiveReport(null)} variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={18} /> Voltar
            </Button>
            <Button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--primary-color)' }}>
              <Printer size={18} /> Imprimir Relatório
            </Button>
          </div>

          <div className={`print-area ${activeReport === 'completo' ? 'landscape-print' : 'portrait-print'}`} style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', border: 'none', minHeight: '800px' }}>
            
            {(() => {
              const contestNumber = localStorage.getItem('contestNumber') || '01/2026';
              const startDate = localStorage.getItem('contestStartDate') ? new Date(localStorage.getItem('contestStartDate')).toLocaleDateString('pt-BR') : '01/01/2026';
              const endDate = localStorage.getItem('contestEndDate') ? new Date(localStorage.getItem('contestEndDate')).toLocaleDateString('pt-BR') : '31/01/2026';

              return (
                <>
                  {/* CABEÇALHO OFICIAL GLOBAL */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem' }}>
                    <img src="/logo.png" alt="Prefeitura" style={{ height: '70px' }} />
                    <div style={{ textAlign: 'left', borderLeft: '2px solid #cbd5e1', paddingLeft: '1.5rem' }}>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>Prefeitura de Terra Boa</h2>
                      <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        <strong>Concurso Público Municipal - Edital Nº {contestNumber}</strong><br/>
                        Período de Inscrições: {startDate} até {endDate}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {activeReport === 'otimizado' && 'RELATÓRIO DE INSCRITOS - LISTA OTIMIZADA'}
                      {activeReport === 'completo' && 'RELATÓRIO DE INSCRITOS - DADOS COMPLETOS'}
                      {activeReport === 'dashboard' && 'RESUMO EXECUTIVO - ESTATÍSTICAS DO CONCURSO'}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Data de Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </>
              );
            })()}

            {/* Renderização condicional dos relatórios */}
            {activeReport === 'otimizado' && (
              <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>Inscrição</th>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>Candidato / Cargo</th>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>Contato</th>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>Local / CEP</th>
                    <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>Cotas</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#475569' }}>{sub.inscricao}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{sub.name}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{sub.cargo}</div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div>{sub.contato}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{sub.email}</div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div>{sub.local} - {sub.uf}</div>
                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>CEP: {sub.cep}</div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {sub.afro && <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>Afro</span>}
                          {sub.lact && <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>Lact</span>}
                          {sub.pcd && sub.pcd !== 'Nenhuma' && <span style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>PCD</span>}
                          {!sub.afro && !sub.lact && (!sub.pcd || sub.pcd === 'Nenhuma') && <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>-</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '1.5rem', textAlign: 'right', fontWeight: 'bold', color: '#1e293b', fontSize: '1rem', borderTop: '2px solid #e2e8f0', paddingTop: '1rem' }}>
                Total de Candidatos Inscritos: {subscribers.length}
              </div>
            </>
            )}

            {activeReport === 'completo' && (
              <>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '2px solid #cbd5e1' }}>Insc.</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '2px solid #cbd5e1' }}>Nome / Cargo</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '2px solid #cbd5e1' }}>Documentos</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '2px solid #cbd5e1' }}>Contato</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '2px solid #cbd5e1' }}>Endereço Completo</th>
                    <th style={{ padding: '0.75rem 0.5rem', borderBottom: '2px solid #cbd5e1' }}>Condições Especiais</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub, idx) => {
                    const formatNascimento = (nasc) => {
                      if (!nasc) return '';
                      const p = nasc.split('-');
                      if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
                      return nasc;
                    };
                    return (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc', pageBreakInside: 'avoid' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: 'bold' }}>{sub.inscricao}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <strong>{sub.name}</strong><br/>
                        <span style={{ color: '#64748b' }}>{sub.cargo}</span><br/>
                        <span style={{ color: '#64748b' }}>Nasc: {formatNascimento(sub.nascimento)}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        CPF: {sub.cpf}<br/>
                        RG: {sub.rg || 'Não inf.'}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {sub.contato}<br/>
                        <span style={{ color: '#64748b' }}>{sub.email}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {sub.endereco}, {sub.numero || 'S/N'} - {sub.bairro}<br/>
                        {sub.local} - {sub.uf} | CEP: {sub.cep}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        {sub.afro && <div>• Afrodescendente</div>}
                        {sub.lact && <div>• Lactante</div>}
                        {sub.pcd && sub.pcd !== 'Nenhuma' && <div>• PCD: {sub.pcd}</div>}
                        {sub.necessidade && sub.necessidade !== 'Nenhuma' && <div>• Req: {sub.necessidade}</div>}
                        {!sub.afro && !sub.lact && (!sub.pcd || sub.pcd === 'Nenhuma') && (!sub.necessidade || sub.necessidade === 'Nenhuma') && '-'}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ marginTop: '2rem', textAlign: 'right', fontWeight: 'bold', color: '#0f172a', fontSize: '1rem', borderTop: '2px solid #cbd5e1', paddingTop: '1.5rem', pageBreakInside: 'avoid' }}>
                TOTAL GERAL DE CANDIDATOS INSCRITOS: <span style={{ fontSize: '1.25rem', color: 'var(--primary-color)' }}>{subscribers.length}</span>
              </div>
              </>
            )}

            {activeReport === 'dashboard' && (() => {
              const data = getDashboardData();
              return (
                <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.4', color: '#334155' }}>

                  <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid #e2e8f0', pageBreakInside: 'avoid' }}>
                    <h2 style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '0.25rem' }}>TOTAL DE INSCRIÇÕES CONFIRMADAS</h2>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>{data.total}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', pageBreakInside: 'avoid' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.75rem' }}>
                        Inscritos por Cargo
                      </h3>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {Object.entries(data.cargosCount).sort((a,b) => b[1] - a[1]).map(([cargo, qtd]) => (
                          <li key={cargo} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                            <span>{cargo}</span>
                            <span style={{ fontWeight: 'bold' }}>{qtd}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.75rem' }}>
                        Inscritos por Cidade (Local)
                      </h3>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        {Object.entries(data.cidadesCount).sort((a,b) => b[1] - a[1]).map(([cidade, qtd]) => (
                          <li key={cidade} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                            <span>{cidade}</span>
                            <span style={{ fontWeight: 'bold' }}>{qtd}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div style={{ pageBreakInside: 'avoid' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.75rem' }}>
                      Estatísticas de Cotas e PCD
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Afrodescendentes</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#16a34a' }}>{data.afroCount}</div>
                      </div>
                      <div style={{ width: '1px', backgroundColor: '#cbd5e1' }}></div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Lactantes</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#3b82f6' }}>{data.lactCount}</div>
                      </div>
                      <div style={{ width: '1px', backgroundColor: '#cbd5e1' }}></div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>PCD (Total)</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#9333ea' }}>{data.pcdCount}</div>
                      </div>
                    </div>
                    
                    {data.pcdCount > 0 && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <h4 style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Detalhes PCD:</h4>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
                          {Object.entries(data.pcdTypes).map(([tipo, qtd]) => (
                            <li key={tipo} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                              <span>- {tipo}</span>
                              <span style={{ fontWeight: 'bold' }}>{qtd}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
};
