const Button = ({ children, variant = 'primary', size = 'md', icon: Icon, onClick, disabled, className = '' }) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors rounded-lg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-teal-600 text-white hover:bg-teal-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className={`${children ? 'ml-2' : ''} w-4 h-4`} />}
      {children}
    </button>
  );
};

export default Button;