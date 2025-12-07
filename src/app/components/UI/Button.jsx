// src/components/ui/Button.jsx
'use client';

export default function Button({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon = null
}) {
  
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 active:scale-95',
    danger: 'bg-red-500 hover:bg-red-600 text-white active:scale-95',
    success: 'bg-green-500 hover:bg-green-600 text-white active:scale-95',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 active:scale-95',
    ghost: 'text-gray-700 hover:bg-gray-100 active:scale-95'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}