import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Trash2, Edit2, User as UserIcon, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'Usuário' });
  const [editingUser, setEditingUser] = useState({ id: null, name: '', email: '', password: '', confirmPassword: '', role: 'Usuário' });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Carregar os usuários do Supabase ao iniciar
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('admin_users').select('*').order('id', { ascending: true });
    if (error) {
      console.error('Erro ao buscar usuários:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleRoleChange = async (id, newRole) => {
    // Atualizar na interface imediatamente
    setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    
    // Atualizar no banco
    const { error } = await supabase.from('admin_users').update({ role: newRole }).eq('id', id);
    if (error) console.error('Erro ao atualizar papel:', error);

    // Se for o usuário atual logado, atualizar o localStorage
    const loggedEmail = localStorage.getItem('adminLoggedEmail');
    const user = users.find(u => u.id === id);
    if (user && user.email === loggedEmail) {
      localStorage.setItem('userRole', newRole);
      window.dispatchEvent(new Event('userRoleChanged'));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    setUsers(users.filter(u => u.id !== id));
    const { error } = await supabase.from('admin_users').delete().eq('id', id);
    if (error) {
      console.error('Erro ao deletar usuário:', error);
      fetchUsers(); // reverte se falhou
    }
  };

  const openNewUserModal = () => {
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newUser.name || !newUser.email || !newUser.password) return;
    
    if (newUser.password !== newUser.confirmPassword) {
      setErrorMsg('As senhas não coincidem!');
      return;
    }
    
    // Preparar dados (remover confirmPassword antes de salvar)
    const { confirmPassword, ...userData } = newUser;

    // Inserir no Supabase
    const { data, error } = await supabase.from('admin_users').insert([userData]).select();
    
    if (error) {
      console.error('Erro ao adicionar usuário:', error);
      setErrorMsg('Erro ao adicionar usuário. Pode ser um e-mail já existente.');
      return;
    }

    if (data && data.length > 0) {
      setUsers([...users, data[0]]);
    }
    
    setIsModalOpen(false);
    setNewUser({ name: '', email: '', password: '', confirmPassword: '', role: 'Usuário' });
  };

  const openEditModal = (user) => {
    setErrorMsg('');
    setEditingUser({ ...user, password: '', confirmPassword: '' }); // Limpa a senha por padrão para edição
    setIsEditModalOpen(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!editingUser.name || !editingUser.email) return;

    if (editingUser.password && editingUser.password !== editingUser.confirmPassword) {
      setErrorMsg('As senhas não coincidem!');
      return;
    }

    const updates = {
      name: editingUser.name,
      email: editingUser.email,
      role: editingUser.role,
    };
    
    if (editingUser.password) {
      updates.password = editingUser.password;
    }

    // Atualiza na interface
    setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updates } : u));

    // Atualiza no Supabase
    const { error } = await supabase.from('admin_users').update(updates).eq('id', editingUser.id);
    
    if (error) {
      console.error('Erro ao editar usuário:', error);
      setErrorMsg('Erro ao editar usuário.');
      fetchUsers(); // reverte se falhou
      return;
    }

    setIsEditModalOpen(false);
  };

  return (
    <div>
      {/* Settings Header Card */}
      <div style={{ backgroundColor: '#f8fafc', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: '800', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserIcon size={16} color="var(--primary-color)" /> Gerenciamento de Usuários
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem', marginBottom: '0', fontWeight: '500' }}>
            {loading ? 'Carregando...' : `${users.length} ${users.length === 1 ? 'usuário registrado' : 'usuários registrado'}`}
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button onClick={openNewUserModal} style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>+ Novo Usuário</Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-responsive" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', textAlign: 'left', fontSize: '0.75rem', color: 'var(--text-dark)' }}>
              <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Usuário</th>
              <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Email</th>
              <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Tipo</th>
              <th style={{ padding: '0.5rem 1rem', fontWeight: 'normal' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-dark)' }}>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', backgroundColor: '#e0e7ff', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>{user.name}</div>
                  </div>
                </td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  ✉ {user.email}
                </td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <div style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white' }}>
                    <UserIcon size={14} color="var(--text-gray)" />
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)} 
                      style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--text-dark)', paddingRight: '0.5rem' }}
                    >
                      <option value="Usuário">Usuário</option>
                      <option value="Administrador">Administrador</option>
                    </select>
                  </div>
                </td>
                <td style={{ padding: '0.5rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openEditModal(user)} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteUser(user.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-gray)' }}>Nenhum usuário encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Novo Usuário */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Novo Usuário</h3>
            
            {errorMsg && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {errorMsg}
              </div>
            )}
            
            <form onSubmit={handleAddUser}>
              <div style={{ marginBottom: '1rem' }}>
                <Input 
                  label="Nome Completo" 
                  placeholder="Nome do usuário" 
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <Input 
                  type="email"
                  label="Email" 
                  placeholder="email@exemplo.com" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <Input 
                  type="password"
                  label="Senha" 
                  placeholder="••••••••" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <Input 
                  type="password"
                  label="Confirmar Senha" 
                  placeholder="••••••••" 
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Tipo de Usuário</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-dark)' }}
                >
                  <option value="Usuário">Usuário</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>Salvar Usuário</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Usuário */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              onClick={() => setIsEditModalOpen(false)} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Editar Usuário</h3>
            
            {errorMsg && (
              <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {errorMsg}
              </div>
            )}
            
            <form onSubmit={handleEditUser}>
              <div style={{ marginBottom: '1rem' }}>
                <Input 
                  label="Nome Completo" 
                  placeholder="Nome do usuário" 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <Input 
                  type="email"
                  label="Email" 
                  placeholder="email@exemplo.com" 
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <Input 
                  type="password"
                  label="Nova Senha" 
                  placeholder="Deixe em branco para não alterar" 
                  value={editingUser.password}
                  onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                />
              </div>
              {editingUser.password && (
                <div style={{ marginBottom: '1rem' }}>
                  <Input 
                    type="password"
                    label="Confirmar Nova Senha" 
                    placeholder="Digite novamente a nova senha" 
                    value={editingUser.confirmPassword}
                    onChange={(e) => setEditingUser({...editingUser, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              )}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Tipo de Usuário</label>
                <select 
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-dark)' }}
                >
                  <option value="Usuário">Usuário</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                <Button type="submit" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>Atualizar Usuário</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
