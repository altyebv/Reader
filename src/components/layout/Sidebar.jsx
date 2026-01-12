import React, { useState } from 'react';
import { Upload, Search, LayoutDashboard, FileText, ChevronRight, ChevronLeft } from 'lucide-react';

const Sidebar = ({ activeView, onViewChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'processing', icon: FileText, label: 'معالجة الإشعارات' },
    { id: 'search', icon: Search, label: 'البحث والاستعلام' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' }
  ];

  return (
    <div 
      className={`bg-slate-800 text-white h-screen flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex items-center justify-between">
        {!collapsed && (
          <div className="flex-1">
            <h1 className="text-xl font-bold text-right">نظام الإشعارات</h1>
            <p className="text-sm text-slate-400 text-right mt-1">معالجة ذكية للبيانات</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title={collapsed ? 'توسيع' : 'طي'}
        >
          {collapsed ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              collapsed ? 'justify-center' : 'justify-end'
            } ${
              activeView === item.id
                ? 'bg-teal-600 text-white'
                : 'text-slate-300 hover:bg-slate-700'
            }`}
            title={collapsed ? item.label : ''}
          >
            {!collapsed && <span>{item.label}</span>}
            <item.icon className="w-5 h-5 flex-shrink-0" />
          </button>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-700 text-xs text-slate-400 text-center">
          v1.0.0 • Built with ♥
        </div>
      )}
    </div>
  );
};

export default Sidebar;