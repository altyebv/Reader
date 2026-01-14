import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';

const ColumnSelector = ({ selectedColumns, onToggleColumn, allColumns }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 flex items-center gap-1.5 font-bold text-gray-700 text-sm transition-all"
      >
        <CheckSquare className="w-3.5 h-3.5" />
        الأعمدة ({selectedColumns.length})
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-1 w-56 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 p-2">
            <div className="space-y-1 max-h-64 overflow-auto">
              {allColumns.map(col => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 p-2 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col.key)}
                    onChange={() => onToggleColumn(col.key)}
                    className="w-3.5 h-3.5 text-teal-600 rounded focus:ring-teal-500 border-2 border-gray-300"
                  />
                  <span className="text-xs font-bold text-gray-900 flex-1 text-right group-hover:text-teal-700">
                    {col.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ColumnSelector;