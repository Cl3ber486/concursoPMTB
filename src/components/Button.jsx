import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = 'button-base';
  const variantStyle = variant === 'primary' ? 'button-primary' : variant === 'success' ? 'button-success' : 'button-secondary';
  
  return (
    <button className={`${baseStyle} ${variantStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};
