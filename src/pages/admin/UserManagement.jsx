import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Trash2, User as UserIcon } from 'lucide-react';

export const UserManagement = () => {
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'Administrador');

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
    window.dispatchEvent(new Event('userRoleChanged'));
  };

  return (
    <div>
      {/* Settings Header Card */}
      <div style={{ backgroundColor: '#f8fafc', borderRadius: 'var(--radius-lg)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
        <div>
          <h2 style={{ fontSize: '0.875rem', fontWeight: '800', color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserIcon size={16} color="var(--primary-color)" /> Gerenciamento de Usuários
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.25rem', marginBottom: '0', fontWeight: '500' }}>1 usuário registrado</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Button style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>+ Novo Usuário</Button>
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
            <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-dark)' }}>
              <td style={{ padding: '0.5rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '36px', height: '36px', backgroundColor: '#e0e7ff', color: 'var(--primary-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    A
                  </div>
                  <div>Anselmo Pavani</div>
                </div>
              </td>
              <td style={{ padding: '0.5rem 1rem' }}>
                ✉ anselmo@terraboa.pr.gov.br
              </td>
              <td style={{ padding: '0.5rem 1rem' }}>
                <div style={{ padding: '0.25rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white' }}>
                  <UserIcon size={14} color="var(--text-gray)" />
                  <select 
                    value={userRole} 
                    onChange={handleRoleChange} 
                    style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--text-dark)', paddingRight: '0.5rem' }}
                  >
                    <option value="Usuário">Usuário</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              </td>
              <td style={{ padding: '0.5rem 1rem' }}>
                <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
