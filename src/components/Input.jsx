import React from 'react';

export const Input = ({ label, id, ...props }) => {
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}</label>}
      <input id={id} className="input-field" {...props} />
    </div>
  );
};
