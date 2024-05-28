import React from 'react';
import './Checkbox.css';


interface CheckboxProps {
  label: string;
  value?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, value = false, onChange }) => {
  return (
    <label className="checkbox">
      <input
        type="checkbox"
        checked={value}
        onChange={onChange}
        className="checkbox-input"
      />
      <span className="checkbox-custom"></span>
      {label}
    </label>
  );
};

export default Checkbox;