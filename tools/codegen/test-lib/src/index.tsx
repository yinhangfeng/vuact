import React from 'react';

export interface ButtonProps {
  onClick?: () => void;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  value,
  onChange,
  disabled,
  children
}) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children || value}
    </button>
  );
};

export interface ModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  children
}) => {
  if (!open) return null;
  
  return (
    <div className="modal">
      <div className="modal-header">{title}</div>
      <div className="modal-content">{children}</div>
      <button onClick={() => onOpenChange?.(false)}>Close</button>
    </div>
  );
};

export interface InputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  label
}) => {
  return (
    <div className="input-wrapper">
      {label && <label>{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export interface SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: Array<{ label: string; value: string }>;
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  children
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
      {children}
    </select>
  );
};
