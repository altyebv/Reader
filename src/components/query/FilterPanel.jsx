import React from 'react';
import { Filter, X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

// Utility function to convert YYYY-MM-DD to MM/DD/YYYY
const formatDateForQuery = (dateStr) => {
  if (!dateStr) return '';
  
  // Input format: YYYY-MM-DD
  const [year, month, day] = dateStr.split('-');
  
  // Output format: MM/DD/YYYY (matching your database)
  return `${month}/${day}/${year}`;
};

// Utility function to convert MM/DD/YYYY to YYYY-MM-DD for input
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  
  // Input format: MM/DD/YYYY
  const [month, day, year] = dateStr.split('/');
  
  // Output format: YYYY-MM-DD (for HTML input)
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const AutocompleteInput = ({ label, value, onChange, onSearch, placeholder, dir }) => {
  const [suggestions, setSuggestions] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSearch = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await onSearch(query);
      setSuggestions(results || []);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          handleSearch(e.target.value);
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium transition-all"
        dir={dir}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-teal-300 rounded-lg shadow-2xl max-h-48 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                onChange(item.value);
                setShowSuggestions(false);
              }}
              className="w-full px-3 py-2 text-sm text-gray-900 text-left hover:bg-teal-100 border-b border-gray-200 last:border-b-0 transition-colors"
              dir={dir}
            >
              <div className="font-bold text-gray-800">{item.value}</div>
              {item.display_name && (
                <div className="text-xs text-gray-600 font-medium">{item.display_name}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const DateRangePicker = ({ dateFrom, dateTo, onDateFromChange, onDateToChange }) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const [localDateFrom, setLocalDateFrom] = React.useState('');
  const [localDateTo, setLocalDateTo] = React.useState('');

  React.useEffect(() => {
    setLocalDateFrom(formatDateForInput(dateFrom));
    setLocalDateTo(formatDateForInput(dateTo));
  }, [dateFrom, dateTo]);

  const handleApply = () => {
    if (localDateFrom) {
      onDateFromChange(formatDateForQuery(localDateFrom));
    }
    if (localDateTo) {
      onDateToChange(formatDateForQuery(localDateTo));
    }
    setShowPicker(false);
  };

  const handleClear = () => {
    setLocalDateFrom('');
    setLocalDateTo('');
    onDateFromChange('');
    onDateToChange('');
    setShowPicker(false);
  };

  const getDisplayText = () => {
    if (!dateFrom && !dateTo) return 'اختر نطاق التاريخ';
    
    const parts = [];
    if (dateFrom) parts.push(`من: ${dateFrom}`);
    if (dateTo) parts.push(`إلى: ${dateTo}`);
    return parts.join(' | ');
  };

  return (
    <div className="relative col-span-2 z-50">
      <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
        نطاق التاريخ
      </label>
      
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        className={`w-full px-3 py-1.5 text-sm border-2 rounded-lg flex items-center justify-between transition-all ${
          dateFrom || dateTo
            ? 'border-teal-500 bg-teal-50 text-teal-900'
            : 'border-gray-300 bg-white text-gray-600'
        } hover:border-teal-500 focus:ring-2 focus:ring-teal-500`}
      >
        <Calendar className="w-4 h-4" />
        <span className="flex-1 text-right font-medium">{getDisplayText()}</span>
      </button>

      {showPicker && (
        <div className="absolute z-50 mt-2 p-4 bg-white border-2 border-gray-300 rounded-lg shadow-xl w-full md:w-96 right-0">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                من تاريخ
              </label>
              <input
                type="date"
                value={localDateFrom}
                onChange={(e) => setLocalDateFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-right">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={localDateTo}
                onChange={(e) => setLocalDateTo(e.target.value)}
                className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleClear}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-colors"
              >
                مسح
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-3 py-2 text-sm bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 font-bold shadow-md transition-all"
              >
                تطبيق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-visible relative z-40">
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

            {/* Date Range Picker */}
            <DateRangePicker
              dateFrom={filters.date_from}
              dateTo={filters.date_to}
              onDateFromChange={(value) => onFilterChange('date_from', value)}
              onDateToChange={(value) => onFilterChange('date_to', value)}
            />

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