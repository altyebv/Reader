import { LayoutDashboard } from 'lucide-react';
const DashboardPage = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-right">لوحة التحكم</h2>
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600">قريباً - إحصائيات ومعلومات عامة</p>
      </div>
    </div>
  );
};

export default DashboardPage;