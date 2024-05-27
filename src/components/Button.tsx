import React, { ReactNode, useRef } from 'react';
import './Button.css';

interface ButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  color?: 'success' | 'info' | 'error' | 'warning';
}

const Button: React.FC<ButtonProps> = ({ label, className, children, onClick = undefined, disabled = false, color = 'info' }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - rect.left - radius}px`;
    ripple.style.top = `${event.clientY - rect.top - radius}px`;
    ripple.classList.add('ripple');

    const rippleContainer = button.querySelector('.ripple-container');
    rippleContainer?.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });

    if (onClick) onClick();
  };

  const buttonColorStyle = {
    '--button-color': `var(--${color}-color)`,
    '--button-hover-color': `var(--${color}-color-dark)`
  } as React.CSSProperties;

  return (
    <button 
      ref={buttonRef}
      className={`material-button ${className}`} 
      onClick={handleClick} 
      disabled={disabled}
      style={buttonColorStyle}
      >
      <span className="ripple-container"></span>
      {label}
      {children}
    </button>
  );
};

export default Button;