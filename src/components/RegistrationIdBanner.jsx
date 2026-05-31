import React, { useEffect, useState } from 'react';

export const RegistrationIdBanner = () => {
  const [registrationId, setRegistrationId] = useState('');

  useEffect(() => {
    let id = sessionStorage.getItem('registrationId');
    if (!id) {
      id = Math.random().toString(36).substring(2, 7).toUpperCase();
      sessionStorage.setItem('registrationId', id);
    }
    setRegistrationId(id);
  }, []);

  if (!registrationId) return null;

  return (
    <div className="info-banner" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="info-banner-label" style={{ fontWeight: '500' }}>Número de Identificação:</span>
      <span className="info-banner-value" style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '1px' }}>{registrationId}</span>
    </div>
  );
};
