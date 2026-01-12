import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const ConfidenceIndicator = ({ confidence }) => {
  const getColor = (conf) => {
    if (conf >= 0.9) return 'bg-green-500';
    if (conf >= 0.7) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getIcon = (conf) => {
    if (conf >= 0.9) return CheckCircle;
    return AlertTriangle;
  };

  const Icon = getIcon(confidence);
  const percentage = (confidence * 100).toFixed(0);

  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
      <Icon className={`w-4 h-4 ${confidence >= 0.9 ? 'text-green-600' : 'text-amber-600'}`} />
      <span className="text-xs text-gray-500">{percentage}%</span>
    </div>
  );
};

export default ConfidenceIndicator;