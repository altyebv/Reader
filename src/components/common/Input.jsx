import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const ConfidenceIndicator = ({ confidence }) => {
  if (confidence === undefined || confidence === null) return null;

  const getColor = (conf) => {
    if (conf >= 0.9) return 'text-green-600';
    if (conf >= 0.7) return 'text-amber-600';
    return 'text-red-600';
  };

  const getIcon = (conf) => {
    if (conf >= 0.9) return CheckCircle;
    if (conf >= 0.7) return AlertTriangle;
    return XCircle;
  };

  const Icon = getIcon(confidence);
  const percentage = (confidence * 100).toFixed(0);

  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
      <span className={`text-xs font-medium ${getColor(confidence)}`}>{percentage}%</span>
      <Icon className={`w-4 h-4 ${getColor(confidence)}`} />
    </div>
  );
};

const Input = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  error, 
  confidence, 
  dir = 'ltr', 
  className = '' 
}) => {
  const getBorderColor = () => {
    if (error) return 'border-red-400 bg-red-50';
    if (confidence !== undefined) {
      if (confidence >= 0.9) return 'border-green-300 bg-green-50';
      if (confidence >= 0.7) return 'border-amber-300 bg-amber-50';
      return 'border-red-300 bg-red-50';
    }
    return 'border-gray-300 bg-white';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700 text-right">
        {label}
      </label>
      <div className="relative text-black">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          dir={dir}
          className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
            getBorderColor()
          } ${confidence !== undefined ? 'pl-10' : ''} ${className}`}
        />
        <ConfidenceIndicator confidence={confidence} />
      </div>
      {error && (
        <div className="flex items-center justify-end gap-1.5 text-right">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
          <span className="text-xs text-red-600 font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

export default Input;