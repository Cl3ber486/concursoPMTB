import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, User, LogOut, Settings } from 'lucide-react';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'Administrador');
  const [userName, setUserName] = useState(localStorage.getItem('adminLoggedName') || 'Usuário');

  useEffect(() => {
    // Force light mode in Admin
    document.body.classList.remove('dark');
    
    const contestType = localStorage.getItem('contestType') || 'Concurso Público';
    const contestNumber = localStorage.getItem('contestNumber') || '01/2026';
    document.title = `Administração - ${contestType} ${contestNumber}`;
    const handleRoleChanged = () => {
      setUserRole(localStorage.getItem('userRole') || 'Administrador');
      setUserName(localStorage.getItem('adminLoggedName') || 'Usuário');
    };
    const handleCustomizationChanged = () => {
      const type = localStorage.getItem('contestType') || 'Concurso Público';
      const number = localStorage.getItem('contestNumber') || '01/2026';
      document.title = `Administração - ${type} ${number}`;
    };
    window.addEventListener('userRoleChanged', handleRoleChanged);
    window.addEventListener('customizationChanged', handleCustomizationChanged);
    return () => {
      const type = localStorage.getItem('contestType') || 'Concurso Público';
      const number = localStorage.getItem('contestNumber') || '01/2026';
      document.title = `Inscrição - ${type} ${number}`;
      window.removeEventListener('userRoleChanged', handleRoleChanged);
      window.removeEventListener('customizationChanged', handleCustomizationChanged);
    };
  }, []);
  
  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Visão Geral' },
    { path: '/admin/inscritos', icon: Users, label: 'Inscritos' },
    { path: '/admin/usuarios', icon: User, label: 'Usuários' },
    { path: '/admin/configuracoes', icon: Settings, label: 'Configurações' }
  ];

  const visibleNavItems = navItems.filter(item => {
    if ((item.label === 'Configurações' || item.label === 'Usuários') && userRole === 'Usuário') return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Navbar */}
      <header className="no-print" style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border-color)', padding: '1rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo Area */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="premium-logo-wrapper">
                <img src="/logo.png" alt="Prefeitura da Cidade de Terra Boa" style={{ height: '80px' }} />
              </div>
            </div>
            <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }}></div>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>Dashboard de Inscrições</h1>
          </div>

          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
            <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-gray)', display: 'block', fontSize: '0.75rem' }}>Bem-vindo</span>
              <span style={{ color: 'var(--text-dark)', fontWeight: '500' }}>
                {userName.split(' ')[0]}
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--bg-main)', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} />
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', backgroundColor: 'var(--success-color)', borderRadius: '50%', border: '2px solid white' }}></div>
            </div>
            <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', color: 'var(--text-gray)', marginLeft: '0.5rem', cursor: 'pointer' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Subnav */}
      <div className="no-print" style={{ backgroundColor: 'white', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '1rem', padding: '0.5rem 2rem' }}>
          {visibleNavItems.map(item => (
            <NavLink 
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--primary-color)' : 'var(--text-gray)',
                backgroundColor: isActive ? 'var(--bg-main)' : 'transparent',
                fontWeight: isActive ? '500' : '400',
                fontSize: '0.875rem',
                textDecoration: 'none'
              })}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 2rem' }}>
        <Outlet />
      </main>
    </div>
  );
};
