import React from 'react';
import Sidebar from './Sidebar.jsx';

const AppLayout = ({ children, activeView, onViewChange }) => {
  return (
    <div className="flex flex-row-reverse h-screen bg-gray-50">
      <Sidebar activeView={activeView} onViewChange={onViewChange} />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;