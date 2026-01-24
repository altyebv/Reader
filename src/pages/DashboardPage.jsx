import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Archive, 
  BarChart3,
  FileText,
  Settings,
  ArrowRight
} from 'lucide-react';
import KnownAccountsManager from '../components/dashboard/KnownAccounts.jsx';
import ArchiveManager from '../components/dashboard/Archive.jsx';

const DashboardPage = () => {
  const [activeSection, setActiveSection] = useState(null);

  // Dashboard sections/cards
  const sections = [
    {
      id: 'accounts',
      title: 'الحسابات المعروفة',
      description: 'إدارة الحسابات للإكمال التلقائي',
      icon: Users,
      color: 'from-teal-400 to-teal-600',
      bgColor: 'from-teal-50 to-white',
      component: KnownAccountsManager
    },
    {
      id: 'archive',
      title: 'أرشيف الإيصالات',
      description: 'عرض وإدارة صور الإيصالات المحفوظة',
      icon: Archive,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'from-blue-50 to-white',
      component: ArchiveManager
    },
    {
      id: 'stats',
      title: 'الإحصائيات',
      description: 'عرض تقارير وإحصائيات المعاملات',
      icon: BarChart3,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'from-purple-50 to-white',
      component: null, // TODO: Create stats component
      disabled: true
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      description: 'إعدادات النظام والتفضيلات',
      icon: Settings,
      color: 'from-gray-400 to-gray-600',
      bgColor: 'from-gray-50 to-white',
      component: null, // TODO: Create settings component
      disabled: true
    }
  ];

  const ActiveComponent = activeSection ? sections.find(s => s.id === activeSection)?.component : null;

  return (
    <div className="p-8">
      {/* Header with back button if viewing a section */}
      <div className="mb-6">
        {activeSection ? (
          <button
            onClick={() => setActiveSection(null)}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold mb-4 transition-all"
          >
            <ArrowRight className="w-5 h-5" />
            <span>العودة إلى لوحة التحكم</span>
          </button>
        ) : (
          <div className="flex justify-end items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div >
              <h2 className="text-2xl font-bold text-gray-900 text-right">لوحة التحكم</h2>
              <p className="text-sm text-gray-600 text-right">إدارة وتكوين النظام</p>
            </div>
          </div>
        )}
      </div>

      {/* Show component if section selected, otherwise show cards */}
      {activeSection && ActiveComponent ? (
        <ActiveComponent />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            
            return (
              <button
                key={section.id}
                onClick={() => !section.disabled && setActiveSection(section.id)}
                disabled={section.disabled}
                className={`
                  relative group text-right
                  bg-gradient-to-br ${section.bgColor}
                  rounded-2xl shadow-lg border-2 border-gray-200
                  hover:border-teal-400 hover:shadow-xl
                  transition-all duration-300 p-6
                  ${section.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Icon */}
                <div className={`
                  w-16 h-16 rounded-xl mb-4
                  bg-gradient-to-br ${section.color}
                  flex items-center justify-center shadow-lg
                  group-hover:scale-110 transition-transform duration-300
                `}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  {section.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4" style={{ fontFamily: 'Cairo, sans-serif' }}>
                  {section.description}
                </p>

                {/* Action indicator */}
                {!section.disabled && (
                  <div className="flex items-center gap-2 text-teal-600 font-bold text-sm group-hover:gap-3 transition-all">
                    <span>فتح</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}

                {section.disabled && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold">
                    قريباً
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;