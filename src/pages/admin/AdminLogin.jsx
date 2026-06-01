import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { supabase } from '../../lib/supabase';

export const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Buscar o usuário no Supabase validando email E senha
      const { data: users, error: dbError } = await supabase
        .from('admin_users')
        .select('*')
        .ilike('email', email)
        .eq('password', password)
        .limit(1);

      if (dbError) throw dbError;

      const user = users && users.length > 0 ? users[0] : null;

      if (user) {
        // Login bem sucedido
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('adminLoggedEmail', user.email);
        localStorage.setItem('adminLoggedName', user.name);
        window.dispatchEvent(new Event('userRoleChanged'));
        navigate('/admin/dashboard');
      } else {
        // Falha no login
        setError('E-mail ou senha incorretos.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao conectar com o banco de dados. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <Card style={{ padding: '3rem 2rem', width: '100%', maxWidth: '400px' }}>
        <Header hideThemeToggle={true} />
        
        <div className="text-center" style={{ margin: '2rem 0' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Bem-vindo!</h2>
          <p style={{ color: 'var(--text-gray)' }}>Entre para acessar o painel.</p>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <Input 
            type="email" 
            placeholder="seuemail@gmail.com" 
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            required
            style={{ paddingLeft: '2.5rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\'/%3E%3Cpolyline points=\'22,6 12,13 2,6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: '10px center' }}
          />
          <Input 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            required
            style={{ paddingLeft: '2.5rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Crect x=\'3\' y=\'11\' width=\'18\' height=\'11\' rx=\'2\' ry=\'2\'/%3E%3Cpath d=\'M7 11V7a5 5 0 0 1 10 0v4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: '10px center' }}
          />
          <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Carregando...' : 'Entrar'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
