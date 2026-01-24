import React from 'react';

/**
 * Professional Button Component
 * Reusable button with consistent styling
 */
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  icon: Icon, 
  disabled = false,
  className = ''
}) => {
  const baseClasses = "flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02]",
    outline: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 shadow-sm hover:shadow-md hover:scale-[1.02]",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 hover:scale-[1.02]",
    danger: "bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl hover:shadow-rose-500/30 hover:scale-[1.02]"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export default Button;