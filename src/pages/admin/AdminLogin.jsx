import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';

export const AdminLogin = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/admin/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <Card style={{ padding: '3rem 2rem', width: '100%', maxWidth: '400px' }}>
        <Header hideThemeToggle={true} />
        
        <div className="text-center" style={{ margin: '2rem 0' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Bem-vindo!</h2>
          <p style={{ color: 'var(--text-gray)' }}>Entre para acessar o painel.</p>
        </div>

        <form onSubmit={handleLogin}>
          <Input 
            type="email" 
            placeholder="seuemail@gmail.com" 
            style={{ paddingLeft: '2.5rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\'/%3E%3Cpolyline points=\'22,6 12,13 2,6\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: '10px center' }}
          />
          <Input 
            type="password" 
            placeholder="••••••••" 
            style={{ paddingLeft: '2.5rem', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239ca3af\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Crect x=\'3\' y=\'11\' width=\'18\' height=\'11\' rx=\'2\' ry=\'2\'/%3E%3Cpath d=\'M7 11V7a5 5 0 0 1 10 0v4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: '10px center' }}
          />
          <Button type="submit" style={{ width: '100%', backgroundColor: '#1e293b', color: 'white', marginTop: '1rem' }}>
            Entrar
          </Button>
        </form>
      </Card>
    </div>
  );
};
