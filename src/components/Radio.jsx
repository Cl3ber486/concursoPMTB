import React from 'react';

export const Radio = ({ label, name, options = [], value, onChange }) => {
  return (
    <div className="input-group" style={{ marginBottom: '1.5rem' }}>
      {label && <label className="input-label">{label}</label>}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        {options.map((opt) => (
          <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input 
              type="radio" 
              name={name} 
              value={opt.value} 
              checked={value === opt.value} 
              onChange={onChange}
              className="custom-radio"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
