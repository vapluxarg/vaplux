import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cta-primary' | 'cta-secondary' | 'modern-primary' | 'modern-secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  let baseClass = 'inline-flex items-center justify-center font-semibold rounded-md transition duration-150 ease-in-out';
  
  if (variant.includes('modern')) {
    baseClass += ' rounded-full gap-2';
  }

  const variants = {
    'primary': 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95',
    'secondary': 'bg-transparent text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white',
    'cta-primary': 'bg-[#1B98E0] text-white shadow-[0_8px_24px_rgba(27,152,224,0.18)] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(0,0,0,0.08),0_8px_24px_rgba(27,152,224,0.18)] active:scale-95',
    'cta-secondary': 'bg-transparent text-[#3A6EA5] border-2 border-[#3A6EA5] hover:bg-[#0A3D62] hover:text-white hover:border-[#0A3D62]',
    'modern-primary': 'bg-gradient-to-b from-[#1B98E0] to-[#168fd3] text-white shadow-[0_8px_24px_rgba(27,152,224,0.18)] hover:-translate-y-[1px] hover:shadow-[0_8px_18px_rgba(0,0,0,0.08),0_8px_24px_rgba(27,152,224,0.18)] active:scale-95',
    'modern-secondary': 'bg-white text-slate-800 border-2 border-[#E3E8EF] shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:bg-slate-50 hover:border-[#D0D7E2]'
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClass = variants[variant] || variants['primary'];
  const sizeClass = sizes[size] || sizes['md'];

  return (
    <button className={`${baseClass} ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
