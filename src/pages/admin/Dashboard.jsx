import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { FileText, Bell } from 'lucide-react';
import { supabase } from '../../config/supabase';

export const Dashboard = () => {
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [subscribersData, setSubscribersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPeriodStart(localStorage.getItem('periodStartDate') || '');
    setPeriodEnd(localStorage.getItem('periodEndDate') || '');

    const fetchSubscribers = async () => {
      try {
        const { data, error } = await supabase.from('subscribers').select('*');
        if (error) throw error;
        setSubscribersData(data || []);
      } catch (err) {
        console.error('Erro ao buscar inscritos no Dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscribers();
  }, []);
  const { 
    cargoData, cityData, pcdData, totalInscricoes, localCount
  } = useMemo(() => {
    const totalInscricoes = subscribersData.length;
    const metaInscricoes = 500; // Meta simulada

    const cargoMap = {};
    const cityMap = {};
    let ampla = 0;
    let pcd = 0;
    let afroLact = 0;
    let localCount = 0;

    subscribersData.forEach(s => {
      // Cargos
      cargoMap[s.cargo] = (cargoMap[s.cargo] || 0) + 1;
      // Cidades
      cityMap[s.local] = (cityMap[s.local] || 0) + 1;
      
      // Alocação (Perfil)
      if (s.pcd) pcd++;
      else if (s.afro || s.lact) afroLact++;
      else ampla++;

      // Regional (Terra Boa)
      if (s.local && s.local.toLowerCase() === 'terra boa') localCount++;
    });

    const cargoData = Object.keys(cargoMap).map(c => ({ name: c, count: cargoMap[c] })).sort((a,b) => b.count - a.count).slice(0, 4);
    const cityData = Object.keys(cityMap).map(c => ({ name: c, count: cityMap[c] })).sort((a,b) => b.count - a.count).slice(0, 4);

    const pcdData = [
      { name: 'Ampla Concorrência', value: ampla, color: '#4db6ac' },
      { name: 'Condições Especiais', value: afroLact, color: '#81c784' },
      { name: 'PCD', value: pcd, color: '#4dd0e1' }
    ].filter(i => i.value > 0);

    return { cargoData, cityData, pcdData, totalInscricoes, localCount };
  }, [subscribersData]);

  // Dados simulados para o gráfico de Área (Evolução) baseados no período
  const areaData = useMemo(() => {
    if (periodStart && periodEnd) {
      const start = new Date(periodStart);
      const end = new Date(periodEnd);
      // Ajuste para garantir que as datas sejam tratadas localmente e não dê diferença de fuso
      start.setMinutes(start.getMinutes() + start.getTimezoneOffset());
      end.setMinutes(end.getMinutes() + end.getTimezoneOffset());

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 60) {
        const data = [];
        let currentCount = 0;
        for (let i = 0; i <= diffDays; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          const name = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d);
          
          if (i === diffDays) {
            currentCount = totalInscricoes;
          } else if (i > 0) {
            currentCount += Math.random() > 0.6 ? 1 : 0;
            if (currentCount > totalInscricoes) currentCount = totalInscricoes;
          }
          data.push({ name, current: currentCount, previous: Math.max(0, currentCount - 1) });
        }
        return data;
      }
    }
    
    return [
      { name: 'Dia 1', current: 0, previous: 0 },
      { name: 'Dia 2', current: 1, previous: 0 },
      { name: 'Dia 3', current: 2, previous: 1 },
      { name: 'Dia 4', current: 3, previous: 2 },
      { name: 'Dia 5', current: 5, previous: 3 },
      { name: 'Dia 6', current: 5, previous: 5 }
    ];
  }, [periodStart, periodEnd, totalInscricoes]);

  // Dados para o Medidor (Candidatos Locais)
  const gaugeValue = localCount;
  const gaugeMax = totalInscricoes;
  const gaugePercent = totalInscricoes ? ((gaugeValue / gaugeMax) * 100).toFixed(1) : 0;
  
  const gaugeData = [
    { name: 'Preenchido', value: gaugeValue, color: '#4db6ac' },
    { name: 'Vazio', value: gaugeMax - gaugeValue, color: '#e0e0e0' }
  ];

  // Estilos globais dos cards (Estética idêntica à imagem)
  const cardStyle = { 
    backgroundColor: 'white', 
    padding: '1.75rem', 
    borderRadius: '1rem', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    display: 'flex',
    flexDirection: 'column'
  };
  const titleStyle = { 
    fontSize: '0.875rem', 
    fontWeight: '800', 
    color: '#2d3748', 
    textTransform: 'uppercase', 
    letterSpacing: '0.05em' 
  };
  const subTitleStyle = { 
    fontSize: '0.75rem', 
    color: '#a0aec0', 
    marginTop: '0.25rem',
    marginBottom: '1.5rem',
    fontWeight: '500'
  };

  const renderProgressBar = (label, value, total, color) => (
    <div key={label} style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: '#2d3748', marginBottom: '0.5rem' }}>
        <span>{label}</span>
        <span>{value} inscritos</span>
      </div>
      <div style={{ width: '100%', height: '6px', backgroundColor: '#edf2f7', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${(value/total)*100}%`, height: '100%', backgroundColor: color, borderRadius: '3px' }}></div>
      </div>
    </div>
  );

  if (isLoading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#a0aec0' }}>Carregando dados do painel...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: '#f0f2f5' }}>
      
      {/* Linha Superior: 2 Colunas */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.5fr', gap: '1.5rem' }}>
        
        {/* Gráfico de Área: Evolução */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={titleStyle}>EVOLUÇÃO DE INSCRIÇÕES</div>
              <div style={subTitleStyle}>Histórico de inscritos atuais vs. estimativa</div>
            </div>
            <select style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#4a5568', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none', fontWeight: '600', backgroundColor: 'white' }}>
              <option>Período Oficial</option>
            </select>
          </div>
          <div style={{ height: '280px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4db6ac" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4db6ac" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4dd0e1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4dd0e1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a0aec0', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a0aec0', fontWeight: 600 }} />
                <Tooltip />
                <Area type="monotone" dataKey="previous" stroke="#4dd0e1" fillOpacity={1} fill="url(#colorPrev)" strokeWidth={2} />
                <Area type="monotone" dataKey="current" stroke="#4db6ac" fillOpacity={1} fill="url(#colorCurrent)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Barras Horizontais: Cargos */}
        <div style={cardStyle}>
          <div style={titleStyle}>CARGOS COM MAIS INSCRITOS</div>
          <div style={subTitleStyle}>Cargos com maior volume de candidatos</div>
          <div style={{ marginTop: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {cargoData.map((c) => renderProgressBar(c.name, c.count, Math.max(...cargoData.map(x=>x.count)), '#4db6ac'))}
          </div>
        </div>

      </div>

      {/* Linha Inferior: 3 Colunas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        
        {/* Barras Horizontais: Cidades */}
        <div style={cardStyle}>
          <div style={titleStyle}>DISTRIBUIÇÃO POR CIDADE</div>
          <div style={subTitleStyle}>Volume de inscritos por localidade</div>
          <div style={{ marginTop: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {cityData.map((c) => renderProgressBar(c.name, c.count, Math.max(...cityData.map(x=>x.count)), '#4dd0e1'))}
          </div>
        </div>

        {/* Gráfico de Rosca: Perfil */}
        <div style={cardStyle}>
          <div style={titleStyle}>PERFIL DOS INSCRITOS</div>
          <div style={subTitleStyle}>Distribuição por modalidades de vaga</div>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ width: '50%', height: '180px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie data={pcdData} innerRadius="50%" outerRadius="85%" cx="50%" cy="50%" paddingAngle={2} dataKey="value" stroke="none">
                    {pcdData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ width: '50%', paddingLeft: '1rem' }}>
              {pcdData.map(item => {
                const pct = ((item.value / totalInscricoes) * 100).toFixed(0);
                return (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', fontSize: '0.75rem', color: '#2d3748', fontWeight: '700' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }}></div>
                      {item.name}
                    </div>
                    <div style={{ color: '#4a5568' }}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gráfico Medidor (Gauge): Regional */}
        <div style={cardStyle}>
          <div style={titleStyle}>CANDIDATOS LOCAIS (TERRA BOA)</div>
          <div style={subTitleStyle}>Proporção de inscritos do município</div>
          
          <div style={{ position: 'relative', height: '110px', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={gaugeData} 
                  cx="50%" cy="100%" 
                  startAngle={180} endAngle={0} 
                  innerRadius={70} outerRadius={90} 
                  dataKey="value" stroke="none"
                >
                  <Cell fill="#4db6ac" />
                  <Cell fill="#edf2f7" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2d3748', lineHeight: '1.2' }}>{gaugePercent}%</div>
              <div style={{ fontSize: '0.75rem', color: '#a0aec0', fontWeight: '700' }}>
                {gaugeValue} / {gaugeMax} inscritos
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button style={{ width: '100%', padding: '0.6rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#4a5568', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
              <FileText size={14} /> Exportar Relatório PDF
            </button>
            <button style={{ width: '100%', padding: '0.6rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#4a5568', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>
              <Bell size={14} /> Central de Alertas
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
