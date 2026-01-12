import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Loader2, CheckSquare, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle } from 'lucide-react';
import { queryTransactions, searchAccounts, exportTransactions } from '../utils/api';

// ============================================================================
// Autocomplete Component
// ============================================================================
const AutocompleteInput = ({ label, value, onChange, onSearch, placeholder, dir = 'ltr' }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = async (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (newValue.length >= 2) {
      setLoading(true);
      try {
        const results = await onSearch(newValue);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    onChange(suggestion.value);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          dir={dir}
          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium"
        />
        {loading && (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-teal-300 rounded-lg shadow-xl max-h-60 overflow-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-right hover:bg-teal-50 flex items-center justify-between border-b border-gray-100 last:border-0 transition-all"
            >
              <div className="flex items-center gap-2">
                {suggestion.verified && (
                  <span className="px-2.5 py-1 bg-green-500 text-white text-xs rounded-full font-bold">✓</span>
                )}
                <span className="text-xs text-gray-600 font-medium">{suggestion.frequency} مرة</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-800">{suggestion.display_name || suggestion.value}</div>
                <div className="text-sm text-teal-600 font-mono">{suggestion.value}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Filter Panel Component
// ============================================================================
const FilterPanel = ({ filters, onFilterChange, onClear, isExpanded, onToggleExpand }) => {
  const hasActiveFilters = Object.values(filters).some(v => v);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-bold text-gray-900">فلاتر البحث</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full font-semibold">
              نشط
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {/* Filter Form */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Transaction ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right">
                رقم العملية
              </label>
              <input
                type="text"
                value={filters.transaction_id}
                onChange={(e) => onFilterChange('transaction_id', e.target.value)}
                placeholder="TRX123456"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium"
                dir="ltr"
              />
            </div>

            {/* From Account - with autocomplete */}
            <AutocompleteInput
              label="من حساب"
              value={filters.from_account}
              onChange={(value) => onFilterChange('from_account', value)}
              onSearch={searchAccounts}
              placeholder="رقم الحساب"
              dir="ltr"
            />

            {/* To Account - with autocomplete */}
            <AutocompleteInput
              label="إلى حساب"
              value={filters.to_account}
              onChange={(value) => onFilterChange('to_account', value)}
              onSearch={searchAccounts}
              placeholder="رقم الحساب"
              dir="ltr"
            />

            {/* Receiver Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right">
                اسم المستلم
              </label>
              <input
                type="text"
                value={filters.receiver_name}
                onChange={(e) => onFilterChange('receiver_name', e.target.value)}
                placeholder="ابحث بالاسم"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium text-right"
                dir="rtl"
                style={{ fontFamily: 'Cairo, sans-serif' }}
              />
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right">
                من تاريخ
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => onFilterChange('date_from', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => onFilterChange('date_to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right">
                أقل مبلغ
              </label>
              <input
                type="number"
                value={filters.min_amount}
                onChange={(e) => onFilterChange('min_amount', e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium"
                dir="ltr"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 text-right">
                أقصى مبلغ
              </label>
              <input
                type="number"
                value={filters.max_amount}
                onChange={(e) => onFilterChange('max_amount', e.target.value)}
                placeholder="10000.00"
                step="0.01"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white text-gray-900 font-medium"
                dir="ltr"
              />
            </div>
          </div>

          {/* Clear Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClear}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold flex items-center gap-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                مسح الفلاتر
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Column Selector Component
// ============================================================================
const ColumnSelector = ({ selectedColumns, onToggleColumn, allColumns }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 font-semibold text-gray-700"
      >
        <CheckSquare className="w-4 h-4" />
        الأعمدة ({selectedColumns.length})
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3">
            <div className="space-y-2 max-h-80 overflow-auto">
              {allColumns.map(col => (
                <label
                  key={col.key}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(col.key)}
                    onChange={() => onToggleColumn(col.key)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-gray-900 flex-1 text-right">
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

// ============================================================================
// Results Table Component
// ============================================================================
const ResultsTable = ({ transactions, selectedColumns, allColumns, sortBy, sortOrder, onSort }) => {
  const visibleColumns = allColumns.filter(col => selectedColumns.includes(col.key));

  const SortIcon = ({ columnKey }) => {
    if (sortBy !== columnKey) return <ArrowUpDown className="w-4 h-4 opacity-30" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {visibleColumns.map(col => (
                <th
                  key={col.key}
                  onClick={() => onSort(col.key)}
                  className="px-4 py-3 text-right text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-2">
                    <SortIcon columnKey={col.key} />
                    {col.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="px-4 py-12 text-center">
                  <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 font-semibold">لا توجد نتائج</p>
                  <p className="text-sm text-gray-400 mt-1">جرّب تعديل معايير البحث</p>
                </td>
              </tr>
            ) : (
              transactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  {visibleColumns.map(col => {
                    const value = col.key === 'id' 
                      ? transaction.id 
                      : transaction.fields[col.key]?.field_value || '-';
                    
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm ${col.align === 'left' ? 'text-left' : 'text-right'} ${col.key === 'amount' ? 'font-bold text-gray-900' : 'text-gray-700'}`}
                        dir={col.dir}
                      >
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============================================================================
// Main Search Page Component
// ============================================================================
const SearchPage = () => {
  const [filters, setFilters] = useState({
    transaction_id: '',
    from_account: '',
    to_account: '',
    receiver_name: '',
    date_from: '',
    date_to: '',
    min_amount: '',
    max_amount: ''
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [exporting, setExporting] = useState(false);

  const ALL_COLUMNS = [
    { key: 'id', label: '#', dir: 'ltr', align: 'left' },
    { key: 'transaction_id', label: 'رقم العملية', dir: 'ltr', align: 'left' },
    { key: 'datetime', label: 'التاريخ والوقت', dir: 'ltr', align: 'left' },
    { key: 'from_account', label: 'من حساب', dir: 'ltr', align: 'left' },
    { key: 'to_account', label: 'إلى حساب', dir: 'ltr', align: 'left' },
    { key: 'receiver_name', label: 'اسم المستلم', dir: 'rtl', align: 'right' },
    { key: 'comment', label: 'التعليق', dir: 'rtl', align: 'right' },
    { key: 'amount', label: 'المبلغ', dir: 'ltr', align: 'left' }
  ];

  const [selectedColumns, setSelectedColumns] = useState(
    ALL_COLUMNS.map(col => col.key)
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Remove empty filters
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          cleanFilters[key] = filters[key];
        }
      });

      const result = await queryTransactions(cleanFilters);
      setTransactions(result.transactions || []);
      setTotalResults(result.total || 0);
    } catch (err) {
      setError(err.message || 'فشل تحميل البيانات');
      console.error('Search error:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      transaction_id: '',
      from_account: '',
      to_account: '',
      receiver_name: '',
      date_from: '',
      date_to: '',
      min_amount: '',
      max_amount: ''
    });
  };

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
    // Client-side sorting
    const sorted = [...transactions].sort((a, b) => {
      let aVal = columnKey === 'id' ? a.id : a.fields[columnKey]?.field_value || '';
      let bVal = columnKey === 'id' ? b.id : b.fields[columnKey]?.field_value || '';
      
      // Handle numeric values
      if (columnKey === 'amount') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    setTransactions(sorted);
  };

  const toggleColumn = (columnKey) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(k => k !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      // Remove empty filters
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          cleanFilters[key] = filters[key];
        }
      });

      const blob = await exportTransactions(cleanFilters, format);
      
      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'فشل تصدير البيانات');
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  const calculateTotal = () => {
    return transactions.reduce((sum, t) => {
      const amount = parseFloat(t.fields.amount?.field_value || 0);
      return sum + amount;
    }, 0);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-right">البحث والاستعلام</h2>
        <p className="text-gray-600 text-right">ابحث عن المعاملات وصدّر البيانات</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 text-right flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">✕</button>
        </div>
      )}

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        isExpanded={isFilterExpanded}
        onToggleExpand={() => setIsFilterExpanded(!isFilterExpanded)}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ColumnSelector
            selectedColumns={selectedColumns}
            onToggleColumn={toggleColumn}
            allColumns={ALL_COLUMNS}
          />

          <button
            onClick={() => handleExport('csv')}
            disabled={exporting || transactions.length === 0}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            تصدير CSV
          </button>

          <button
            onClick={() => handleExport('json')}
            disabled={exporting || transactions.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            تصدير JSON
          </button>
        </div>

        <div className="flex items-center gap-6 text-right">
          <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-0.5">إجمالي النتائج</p>
            <p className="text-xl font-bold text-gray-900">{totalResults.toLocaleString('ar-SA')}</p>
          </div>
          <div className="px-4 py-2 bg-teal-50 rounded-lg border border-teal-200">
            <p className="text-xs text-teal-600 mb-0.5">المجموع الكلي</p>
            <p className="text-xl font-bold text-teal-900">
              {calculateTotal().toLocaleString('ar-SA', { minimumFractionDigits: 2 })} 
            </p>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-3" />
            <p className="text-gray-600">جاري البحث...</p>
          </div>
        </div>
      )}

      {/* Results Table */}
      {!loading && (
        <ResultsTable
          transactions={transactions}
          selectedColumns={selectedColumns}
          allColumns={ALL_COLUMNS}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}
    </div>
  );
};

export default SearchPage;