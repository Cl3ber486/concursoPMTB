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
    cargoData, cityData, pcdData, totalInscricoes, localCount, afroCount, lactCount
  } = useMemo(() => {
    const totalInscricoes = subscribersData.length;
    const metaInscricoes = 500; // Meta simulada

    const cargoMap = {};
    const cityMap = {};
    let ampla = 0;
    let pcd = 0;
    let afro = 0;
    let lact = 0;
    let localCount = 0;

    subscribersData.forEach(s => {
      // Cargos
      cargoMap[s.cargo] = (cargoMap[s.cargo] || 0) + 1;
      // Cidades
      cityMap[s.local] = (cityMap[s.local] || 0) + 1;
      
      // Alocação (Perfil)
      let hasSpecial = false;
      if (s.pcd) { pcd++; hasSpecial = true; }
      if (s.afro) { afro++; hasSpecial = true; }
      if (s.lact) { lact++; hasSpecial = true; }
      
      if (!hasSpecial) {
        ampla++;
      }

      // Regional (Terra Boa)
      if (s.local && s.local.toLowerCase() === 'terra boa') localCount++;
    });

    const cargoData = Object.keys(cargoMap).map(c => ({ name: c, count: cargoMap[c] })).sort((a,b) => b.count - a.count).slice(0, 4);
    const cityData = Object.keys(cityMap).map(c => ({ name: c, count: cityMap[c] })).sort((a,b) => b.count - a.count);

    const pcdTypesCount = {
      'Nenhuma': 0,
      'Deficiência auditiva': 0,
      'Deficiência visual': 0,
      'Deficiência física': 0
    };
    
    subscribersData.forEach(s => {
      if (s.pcd && pcdTypesCount[s.pcd] !== undefined) {
        pcdTypesCount[s.pcd]++;
      } else if (s.pcd) {
        // Fallback for any other custom PCD if it exists
        pcdTypesCount[s.pcd] = (pcdTypesCount[s.pcd] || 0) + 1;
      }
    });

    const pcdColors = ['#e2e8f0', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#aa3bff'];
    const pcdData = Object.keys(pcdTypesCount).map((type, index) => ({
      name: type,
      value: pcdTypesCount[type],
      color: pcdColors[index % pcdColors.length]
    }));

    return { cargoData, cityData, pcdData, totalInscricoes, localCount, afroCount: afro, lactCount: lact };
  }, [subscribersData]);

  const areaData = useMemo(() => {
    if (periodStart && periodEnd) {
      const start = new Date(periodStart);
      const end = new Date(periodEnd);
      // Ajuste para garantir que as datas sejam tratadas localmente e não dê diferença de fuso
      start.setMinutes(start.getMinutes() + start.getTimezoneOffset());
      end.setMinutes(end.getMinutes() + end.getTimezoneOffset());

      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 90) {
        const data = [];
        let cumulative = 0;

        // Agrupar inscritos reais por data
        const countsByDate = {};
        subscribersData.forEach(sub => {
          // Usa dataHora (do Supabase)
          const dataStr = sub.dataHora || sub.created_at;
          const d = dataStr ? new Date(dataStr) : new Date();
          const dateKey = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d);
          countsByDate[dateKey] = (countsByDate[dateKey] || 0) + 1;
        });

        // Determinar o limite final do loop (hoje ou o fim do período, o que for menor)
        const diffTimeToToday = today.getTime() - start.getTime();
        const diffDaysToToday = Math.max(0, Math.ceil(diffTimeToToday / (1000 * 60 * 60 * 24)));
        const finalLoopDays = Math.min(diffDays, diffDaysToToday);

        for (let i = 0; i <= finalLoopDays; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          const name = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(d);
          
          data.push({ 
            name, 
            Inscritos: countsByDate[name] || 0
          });
        }
        return data;
      }
    }
    
    return [];
  }, [periodStart, periodEnd, subscribersData]);

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div>
                <div style={titleStyle}>EVOLUÇÃO DE INSCRIÇÕES</div>
                <div style={subTitleStyle}>Inscritos por dia</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#e6fffa', padding: '0.4rem 1rem', borderRadius: '0.5rem', border: '1px solid #b2f5ea', marginTop: '-1.5rem' }}>
                <span style={{ fontSize: '0.65rem', color: '#047481', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Geral</span>
                <span style={{ fontSize: '1.4rem', color: '#00897b', fontWeight: '900', lineHeight: '1', marginTop: '0.1rem' }}>{totalInscricoes}</span>
              </div>
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a0aec0', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#a0aec0', fontWeight: 600 }} />
                <Tooltip />
                <Area type="monotone" dataKey="Inscritos" stroke="#4db6ac" fillOpacity={1} fill="url(#colorCurrent)" strokeWidth={2} />
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
          <div style={{ marginTop: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflowY: 'auto', maxHeight: '180px', paddingRight: '0.5rem', gap: '0.5rem' }}>
            {cityData.map((c) => renderProgressBar(c.name, c.count, Math.max(...cityData.map(x=>x.count)), '#4dd0e1'))}
          </div>
        </div>

        {/* Gráfico de Rosca: Perfil */}
        <div style={cardStyle}>
          <div style={titleStyle}>PESSOAS COM DEFICIÊNCIA (PCD)</div>
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
                const totalPcds = pcdData.reduce((acc, curr) => acc + curr.value, 0);
                const pct = totalPcds > 0 ? ((item.value / totalPcds) * 100).toFixed(0) : 0;
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

          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ width: '100%', padding: '0.6rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4a5568', fontSize: '0.875rem', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                Afrodescendentes
              </div>
              <span style={{ color: '#2d3748', fontWeight: '800' }}>{afroCount}</span>
            </div>
            <div style={{ width: '100%', padding: '0.6rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#4a5568', fontSize: '0.875rem', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                Lactantes
              </div>
              <span style={{ color: '#2d3748', fontWeight: '800' }}>{lactCount}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
