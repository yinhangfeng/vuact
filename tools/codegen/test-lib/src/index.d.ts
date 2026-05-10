import * as React from 'react';

export interface ButtonProps {
  onClick?: () => void;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export declare const Button: React.FC<ButtonProps>;

export interface ModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children?: React.ReactNode;
}

export declare const Modal: React.FC<ModalProps>;

export interface InputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: React.ReactNode;
}

export declare const Input: React.FC<InputProps>;

export interface SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options?: Array<{ label: string; value: string }>;
  children?: React.ReactNode;
}

export declare const Select: React.FC<SelectProps>;
