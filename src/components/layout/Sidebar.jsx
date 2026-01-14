import React, { useState } from 'react';
import { Upload, Search, LayoutDashboard, FileText, Menu, X } from 'lucide-react';

const Sidebar = ({ activeView, onViewChange }) => {
  const [collapsed, setCollapsed] = useState(true);

  const menuItems = [
    { id: 'processing', icon: FileText, label: 'معالجة الإشعارات' },
    { id: 'search', icon: Search, label: 'البحث والاستعلام' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' }
  ];

  const handleMouseEnter = () => {
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    setCollapsed(true);
  };

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative bg-gradient-to-b from-slate-800 to-slate-900 text-white h-screen flex flex-col transition-all duration-300 shadow-2xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Tongue Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`
          absolute top-4 -left-4 z-50
          w-8 h-16 rounded-r-xl transition-all duration-300
          bg-gradient-to-br from-slate-700 to-slate-800
          hover:from-teal-600 hover:to-teal-700
          border-2 border-l-0 border-slate-600 hover:border-teal-500
          shadow-lg hover:shadow-xl
          flex items-center justify-center
          group
        `}
        title={collapsed ? 'توسيع' : 'طي'}
      >
        {collapsed ? (
          <Menu className="w-4 h-4 text-teal-400 group-hover:text-white transition-colors" />
        ) : (
          <X className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
        )}
      </button>

      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-end">
          {!collapsed && (
            <div className="flex-1">
              <h1 className="text-lg font-bold text-right bg-gradient-to-l from-teal-400 to-teal-200 bg-clip-text text-transparent">
                نظام الإشعارات
              </h1>
              <p className="text-xs text-slate-400 text-right mt-0.5">معالجة ذكية للبيانات</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg 
                transition-all duration-200 group
                ${collapsed ? 'justify-center' : 'justify-end'}
                ${isActive
                  ? 'bg-gradient-to-l from-teal-600 to-teal-700 text-white shadow-lg scale-105'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-102'
                }
              `}
              title={collapsed ? item.label : ''}
            >
              {!collapsed && (
                <span className={`font-semibold transition-all ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                  {item.label}
                </span>
              )}
              <item.icon className={`
                flex-shrink-0 transition-all
                ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}
                ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'}
              `} />
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`
        p-3 border-t border-slate-700/50 
        transition-all duration-300
        ${collapsed ? 'text-center' : ''}
      `}>
        {collapsed ? (
          <div className="w-2 h-2 mx-auto bg-teal-500 rounded-full animate-pulse"></div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
              <span>v1.0.0</span>
            </div>
            <div className="text-xs text-slate-500 text-center">
              Built with <span className="text-red-400">♥</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;