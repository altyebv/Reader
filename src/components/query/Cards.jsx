import React from 'react';
import { Hash, TrendingUp } from 'lucide-react';

const SummaryCards = ({ totalResults, totalAmount }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
            <Hash className="w-3 h-3 text-white" />
          </div>
          <p className="text-xs font-bold text-gray-600">إجمالي النتائج</p>
        </div>
        <p className="text-2xl font-bold text-gray-900">{totalResults.toLocaleString('ar-SA')}</p>
      </div>
      
      <div className="bg-gradient-to-br from-teal-50 to-white rounded-xl border-2 border-teal-200 p-3 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          <p className="text-xs font-bold text-teal-600">المجموع الكلي</p>
        </div>
        <p className="text-2xl font-bold text-teal-900">
          {totalAmount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default SummaryCards;