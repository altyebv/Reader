import { useState } from 'react'
import Main from './components/Main.jsx'
import './App.css'
import { Upload, Search, LayoutDashboard, FileText, CheckCircle, AlertTriangle, X, ZoomIn, ZoomOut, ChevronRight, ChevronLeft } from 'lucide-react';
import AppLayout from './components/layout/AppLayout.jsx';
import ProcessingPage from './pages/ProcessingPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  const [activeView, setActiveView] = useState('processing');

  const renderPage = () => {
    switch (activeView) {
      case 'processing':
        return <ProcessingPage />;
      case 'search':
        return <SearchPage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <ProcessingPage />;
    }
  };

  return (
    <AppLayout activeView={activeView} onViewChange={setActiveView}>
      {renderPage()}
    </AppLayout>
  );
}
