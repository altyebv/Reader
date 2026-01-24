import React from 'react';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const ResultsTable = ({
  transactions,
  selectedColumns,
  allColumns,
  sortBy,
  sortOrder,
  onSort,
  isRTL
}) => {
  const visibleColumns = allColumns.filter(col =>
    selectedColumns.includes(col.key)
  );

  const SortIcon = ({ columnKey }) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />;
    }
    return sortOrder === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5" />
      : <ArrowDown className="w-3.5 h-3.5" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="flex-1 overflow-auto min-h-0">
        {/* 🔴 THIS LINE IS THE FIX */}
        <table className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <thead className="bg-gradient-to-br from-gray-50 to-white border-b-2 border-gray-200 sticky top-0 z-10">
            <tr>
              {visibleColumns.map(col => (
                <th
                  key={col.key}
                  onClick={() => onSort(col.key)}
                  className="px-3 py-2.5 text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap text-start"
                >
                  <div className="flex items-center gap-1.5">
                    <SortIcon columnKey={col.key} />
                    <span>{col.label}</span>
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
                  <p className="text-gray-500 font-bold">لا توجد نتائج</p>
                  <p className="text-sm text-gray-400 mt-1">
                    جرّب تعديل معايير البحث
                  </p>
                </td>
              </tr>
            ) : (
              transactions.map(transaction => (
                <tr
                  key={transaction.id}
                  className="hover:bg-teal-50 transition-colors group"
                >
                  {visibleColumns.map(col => {
                    const value =
                      col.key === 'id'
                        ? transaction.id
                        : transaction.fields[col.key]?.field_value || '-';

                    return (
                      <td
                        key={col.key}
                        dir={col.dir}
                        className={`px-3 py-2.5 text-xs whitespace-nowrap text-start
                          ${col.key === 'amount' ? 'font-bold text-gray-900' : 'text-gray-700'}
                          ${col.key === 'receiver_name' ? 'font-bold' : ''}
                        `}
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

export default ResultsTable;
