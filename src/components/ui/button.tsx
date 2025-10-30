import { ButtonHTMLAttributes, ReactNode, ElementType } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  fullWidth?: boolean;
  as?: ElementType;
  htmlFor?: string;
}

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
  success: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
  danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400',
  info: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
};

export const Button = ({
  variant = 'primary',
  children,
  className = '',
  fullWidth = false,
  as: Component = 'button',
  ...props
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <Component
      className={`${baseClasses} ${variantClasses[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};
