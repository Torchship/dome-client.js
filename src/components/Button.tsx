import React, { ReactNode } from 'react';
import './Button.css';

interface ButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
}

const Button: React.FC<ButtonProps> = ({ label, children, onClick = undefined, disabled = false }) => {
  return (
    <button className="material-button" onClick={onClick} disabled={disabled}>
      {label}
      {children}
    </button>
  );
};

export default Button;