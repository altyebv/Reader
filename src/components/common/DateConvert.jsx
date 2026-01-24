import React from 'react';
import { Clock } from 'lucide-react';

const DateConversionIndicator = ({ converted }) => {
  if (!converted) return null;
  
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-800 border border-indigo-300 shadow-sm">
      <Clock className="w-3 h-3" />
      <span>محول</span>
    </div>
  );
};

export default DateConversionIndicator;