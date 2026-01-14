import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, FileDown, FileJson } from 'lucide-react';
import FilterPanel from '../components/query/FilterPanel';
import ColumnSelector from '../components/query/ColumnSelector';
import SummaryCards from '../components/query/Cards';
import ResultsTable from '../components/query/Results';
import NotificationModal from '../components/common/Notificaion';
import { queryTransactions, searchAccounts, exportTransactions } from '../utils/api';



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
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [exporting, setExporting] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const ALL_COLUMNS = [
    { key: 'id', label: '#', dir: 'ltr', align: 'left' },
    { key: 'transaction_id', label: 'رقم العملية', dir: 'ltr', align: 'left' },
    { key: 'datetime', label: 'التاريخ', dir: 'ltr', align: 'left' },
    { key: 'from_account', label: 'من حساب', dir: 'ltr', align: 'left' },
    { key: 'to_account', label: 'إلى حساب', dir: 'ltr', align: 'left' },
    { key: 'receiver_name', label: 'اسم المستلم', dir: 'rtl', align: 'right' },
    { key: 'comment', label: 'التعليق', dir: 'rtl', align: 'right' },
    { key: 'amount', label: 'المبلغ', dir: 'ltr', align: 'left' }
  ];

  const [selectedColumns, setSelectedColumns] = useState(
    ALL_COLUMNS.map(col => col.key)
  );

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
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) cleanFilters[key] = filters[key];
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
    
    const sorted = [...transactions].sort((a, b) => {
      let aVal = columnKey === 'id' ? a.id : a.fields[columnKey]?.field_value || '';
      let bVal = columnKey === 'id' ? b.id : b.fields[columnKey]?.field_value || '';
      
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
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        if (filters[key]) cleanFilters[key] = filters[key];
      });

      const blob = await exportTransactions(cleanFilters, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get current timestamp for filename
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `transactions_${timestamp}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);      setNotifyOpen(true);    } catch (err) {
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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-white border-b-2 border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 text-right">البحث والاستعلام</h2>
              <p className="text-xs text-gray-600 text-right">ابحث عن المعاملات وصدّر البيانات</p>
            </div>
          </div>

          {/* Summary Cards in Header */}
          <SummaryCards totalResults={totalResults} totalAmount={calculateTotal()} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 p-2 bg-red-50 border-2 border-red-300 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-xs text-red-800 text-right flex-1 font-semibold">{error}</p>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 font-bold">✕</button>
          </div>
        )}
      </div>

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-hidden flex flex-col p-4 gap-3 min-h-0">
        {/* Filter Panel */}
        <div className="flex-shrink-0">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
            isExpanded={isFilterExpanded}
            onToggleExpand={() => setIsFilterExpanded(!isFilterExpanded)}
            onSearchAccounts={searchAccounts}
          />
        </div>

        {/* Toolbar */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ColumnSelector
              selectedColumns={selectedColumns}
              onToggleColumn={toggleColumn}
              allColumns={ALL_COLUMNS}
            />

            <button
              onClick={() => handleExport('xlsx')}
              disabled={exporting || transactions.length === 0}
              className="px-3 py-1.5 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              تصدير إلى Excel
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-teal-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-bold">جاري البحث...</span>
            </div>
          )}
        </div>

        {/* Results Table - Fills remaining space */}
        <div className="flex-1 min-h-0">
          <ResultsTable
            transactions={transactions}
            selectedColumns={selectedColumns}
            allColumns={ALL_COLUMNS}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </div>
      </div>

      <NotificationModal
        isOpen={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        type="success"
        title="تم التصدير"
        message="تم تصدير المعاملات بنجاح!"
        autoClose
        autoCloseDelay={3000}
      />
    </div>
  );
};

export default SearchPage;