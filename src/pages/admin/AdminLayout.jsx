import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, User, LogOut, Settings, ChevronDown, Plus, Check, X, Lock } from 'lucide-react';
import { supabase } from '../../config/supabase';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'Administrador');
  const [userName, setUserName] = useState(localStorage.getItem('adminLoggedName') || 'Usuário');

  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  // Profile state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('adminLoggedAvatar') || '');
  const [newAvatar, setNewAvatar] = useState(localStorage.getItem('adminLoggedAvatar') || '');
  const [newName, setNewName] = useState(localStorage.getItem('adminLoggedName') || '');
  const [newEmail, setNewEmail] = useState(localStorage.getItem('adminLoggedEmail') || '');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const fileInputRef = React.useRef(null);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    
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
      clearInterval(timer);
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
    { path: '/admin/relatorios', icon: FileText, label: 'Relatórios' },
    { path: '/admin/usuarios', icon: User, label: 'Usuários' },
    { path: '/admin/configuracoes', icon: Settings, label: 'Configurações' }
  ];

  const visibleNavItems = navItems.filter(item => {
    if ((item.label === 'Configurações' || item.label === 'Usuários') && userRole === 'Usuário') return false;
    return true;
  });

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileMessage({ type: '', text: '' });
    
    try {
      const email = localStorage.getItem('adminLoggedEmail');
      const updates = {};
      
      if (newPassword) updates.password = newPassword;
      if (newName !== localStorage.getItem('adminLoggedName')) updates.name = newName;
      if (newEmail !== localStorage.getItem('adminLoggedEmail')) updates.email = newEmail;
      
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from('admin_users')
          .update(updates)
          .eq('email', localStorage.getItem('adminLoggedEmail'));
          
        if (error) throw error;
      }
      
      localStorage.setItem('adminLoggedAvatar', newAvatar);
      localStorage.setItem('adminLoggedName', newName);
      localStorage.setItem('adminLoggedEmail', newEmail);
      setAvatarUrl(newAvatar);
      setUserName(newName);
      window.dispatchEvent(new Event('userRoleChanged'));
      
      setProfileMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileMessage({ type: '', text: '' });
        setNewPassword('');
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setProfileMessage({ type: 'error', text: 'Erro ao atualizar o perfil.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

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

          {/* User Info & System Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            
            {/* System Time */}
            <div style={{ textAlign: 'right', color: 'var(--text-gray)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{currentDateTime.toLocaleDateString('pt-BR')}</span>
              <span>{currentDateTime.toLocaleTimeString('pt-BR')}</span>
            </div>

            {/* User Badge & Dropdown */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', padding: '0.25rem' }}
              >
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                    {userName}
                  </span>
                  <span style={{ color: '#0ea5e9', fontSize: '0.8rem', fontWeight: '500' }}>
                    {userRole}
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#e0f2fe', color: '#0284c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} />}
                  </div>
                </div>
                <ChevronDown size={16} color="#64748b" style={{ marginLeft: '0.25rem' }} />
              </div>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', minWidth: '220px', zIndex: 100, overflow: 'hidden', padding: '0.5rem' }}>
                  <button 
                    onClick={() => { 
                      setShowProfileMenu(false); 
                      setShowProfileModal(true); 
                      setIsEditingProfile(false); 
                      setNewName(localStorage.getItem('adminLoggedName') || '');
                      setNewEmail(localStorage.getItem('adminLoggedEmail') || '');
                      setNewAvatar(localStorage.getItem('adminLoggedAvatar') || '');
                    }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#334155', fontSize: '0.9rem', fontWeight: '500', textAlign: 'left', borderRadius: '8px', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Settings size={18} color="#475569" /> Mudar o Perfil
                  </button>
                  <button 
                    onClick={() => navigate('/admin')}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#e53e3e', fontSize: '0.9rem', fontWeight: '500', textAlign: 'left', borderRadius: '8px', transition: 'background 0.2s', marginTop: '0.25rem' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={18} /> Sair do Sistema
                  </button>
                </div>
              )}
            </div>
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowProfileModal(false); }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(3px)' }}
        >
          <div style={{ backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '860px', display: 'flex', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', position: 'relative' }}>

            {/* Fechar */}
            <button
              onClick={() => setShowProfileModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', zIndex: 10, padding: '0.25rem', borderRadius: '6px', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#334155'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              <X size={22} />
            </button>

            {/* ── LEFT SIDEBAR ── */}
            <div style={{ width: '280px', flexShrink: 0, backgroundColor: '#f4f7f9', padding: '3rem 1.75rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #e8ecf0', position: 'relative' }}>

              {/* Toggle edit / editing indicator */}
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  title="Habilitar Edição"
                  style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34,197,94,0.4)', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Plus size={20} />
                </button>
              ) : (
                <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(34,197,94,0.4)' }}>
                  <Check size={20} />
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarFileChange}
              />

              {/* Avatar circle */}
              <div
                onClick={() => isEditingProfile && fileInputRef.current && fileInputRef.current.click()}
                style={{
                  marginTop: '1.5rem',
                  width: '130px', height: '130px', borderRadius: '50%',
                  overflow: 'hidden', border: '4px solid white',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  backgroundColor: '#dce5ee',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                  cursor: isEditingProfile ? 'pointer' : 'default',
                  position: 'relative',
                  transition: 'opacity 0.2s'
                }}
                title={isEditingProfile ? 'Clique para selecionar uma foto' : ''}
              >
                {(isEditingProfile ? newAvatar : avatarUrl)
                  ? <img src={isEditingProfile ? newAvatar : avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <User size={52} color="#8fa5bc" />
                }
                {isEditingProfile && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '38px', backgroundColor: 'rgba(0,0,0,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.04em' }}>ALTERAR</span>
                  </div>
                )}
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#1a2535', margin: '0 0 0.6rem 0', textAlign: 'center' }}>
                {isEditingProfile ? (newName || 'Meu Perfil') : (userName || 'Meu Perfil')}
              </h2>
              <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '0.3rem 1.1rem', borderRadius: '2rem', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.06em' }}>
                {userRole.toUpperCase()}
              </div>

              {isEditingProfile && (
                <button
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <span style={{ fontSize: '1rem' }}>📁</span> Buscar no Computador
                </button>
              )}
            </div>

            {/* ── RIGHT PANE ── */}
            <div style={{ flex: 1, padding: '2.5rem 3rem 2rem', display: 'flex', flexDirection: 'column' }}>

              {/* Alert message */}
              {profileMessage.text && (
                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', backgroundColor: profileMessage.type === 'success' ? '#f0fdf4' : '#fef2f2', color: profileMessage.type === 'success' ? '#166534' : '#991b1b', fontSize: '0.875rem', border: `1px solid ${profileMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {profileMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
                  {profileMessage.text}
                </div>
              )}

              {/* ─ DADOS PESSOAIS ─ */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', paddingBottom: '0.6rem', borderBottom: '1px solid #f0f3f6' }}>
                  <User size={15} color="#38bdf8" />
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Dados Pessoais</span>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Nome Completo</label>
                  <input
                    type="text"
                    value={isEditingProfile ? newName : userName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={!isEditingProfile}
                    placeholder={isEditingProfile ? 'Digite seu nome' : ''}
                    style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.97rem', color: '#334155', backgroundColor: isEditingProfile ? 'white' : '#f8fafc', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => { if (isEditingProfile) e.target.style.borderColor = '#38bdf8'; }}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              {/* ─ ACESSO AO SISTEMA ─ */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.2rem', paddingBottom: '0.6rem', borderBottom: '1px solid #f0f3f6' }}>
                  <Lock size={15} color="#38bdf8" />
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Acesso ao Sistema</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>E-mail</label>
                    <input
                      type="email"
                      value={isEditingProfile ? newEmail : (localStorage.getItem('adminLoggedEmail') || '')}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={!isEditingProfile}
                      placeholder={isEditingProfile ? 'seu@email.com' : ''}
                      style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', color: '#334155', backgroundColor: isEditingProfile ? 'white' : '#f8fafc', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                      onFocus={(e) => { if (isEditingProfile) e.target.style.borderColor = '#38bdf8'; }}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Senha</label>
                    <input
                      type="password"
                      value={isEditingProfile ? newPassword : '••••••••'}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={!isEditingProfile}
                      placeholder={isEditingProfile ? 'Nova senha (opcional)' : ''}
                      style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.95rem', color: '#334155', backgroundColor: isEditingProfile ? 'white' : '#f8fafc', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                      onFocus={(e) => { if (isEditingProfile) e.target.style.borderColor = '#38bdf8'; }}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                </div>
              </div>

              {/* ─ FOOTER ACTIONS ─ */}
              <div style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f0f3f6' }}>
                {!isEditingProfile ? (
                  <div style={{ backgroundColor: '#f8fafc', padding: '0.9rem 1rem', borderRadius: '8px', textAlign: 'center', color: '#94a3b8', fontSize: '0.83rem', fontStyle: 'italic' }}>
                    Clique no botão <strong style={{ color: '#22c55e' }}>+</strong> para editar o perfil.
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setIsEditingProfile(false); setProfileMessage({ type: '', text: '' }); setNewPassword(''); }}
                      style={{ padding: '0.7rem 1.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#475569', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile}
                      style={{ padding: '0.7rem 2.25rem', borderRadius: '8px', border: 'none', backgroundColor: '#0ea5e9', color: 'white', cursor: isSavingProfile ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '0.9rem', opacity: isSavingProfile ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(14,165,233,0.35)', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { if (!isSavingProfile) e.currentTarget.style.backgroundColor = '#0284c7'; }}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0ea5e9'}
                    >
                      {isSavingProfile ? 'Salvando...' : 'Salvar Perfil'}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
