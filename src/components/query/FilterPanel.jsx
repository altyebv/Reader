import React from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import AutocompleteInput from '../query/AutoComplete';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClear, 
  isExpanded, 
  onToggleExpand,
  onSearchAccounts 
}) => {
  const hasActiveFilters = Object.values(filters).some(v => v);

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors bg-gradient-to-br from-gray-50 to-white border-b-2 border-gray-200"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-md">
            <Filter className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">فلاتر البحث</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full font-bold border border-teal-300">
              نشط
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
      </button>

      {/* Filter Form */}
      {isExpanded && (
        <div className="px-4 py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Transaction ID */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                رقم العملية
              </label>
              <input
                type="text"
                value={filters.transaction_id}
                onChange={(e) => onFilterChange('transaction_id', e.target.value)}
                placeholder="TRX123456"
                className="w-full px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium transition-all"
                dir="ltr"
              />
            </div>

            {/* From Account */}
            <AutocompleteInput
              label="من حساب"
              value={filters.from_account}
              onChange={(value) => onFilterChange('from_account', value)}
              onSearch={onSearchAccounts}
              placeholder="رقم الحساب"
              dir="ltr"
            />

            {/* To Account */}
            <AutocompleteInput
              label="إلى حساب"
              value={filters.to_account}
              onChange={(value) => onFilterChange('to_account', value)}
              onSearch={onSearchAccounts}
              placeholder="رقم الحساب"
              dir="ltr"
            />

            {/* Receiver Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                اسم المستلم
              </label>
              <input
                type="text"
                value={filters.receiver_name}
                onChange={(e) => onFilterChange('receiver_name', e.target.value)}
                placeholder="ابحث بالاسم"
                className="w-full px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium text-right transition-all"
                dir="rtl"
                style={{ fontFamily: 'Cairo, sans-serif' }}
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                من تاريخ
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => onFilterChange('date_from', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium transition-all"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => onFilterChange('date_to', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium transition-all"
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                أقل مبلغ
              </label>
              <input
                type="number"
                value={filters.min_amount}
                onChange={(e) => onFilterChange('min_amount', e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium transition-all"
                dir="ltr"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                أقصى مبلغ
              </label>
              <input
                type="number"
                value={filters.max_amount}
                onChange={(e) => onFilterChange('max_amount', e.target.value)}
                placeholder="10000.00"
                step="0.01"
                className="w-full px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium transition-all"
                dir="ltr"
              />
            </div>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={onClear}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 font-bold flex items-center gap-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                مسح الفلاتر
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;