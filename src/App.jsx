import { useState } from 'react';
import './App.css';
import { Upload, Search, LayoutDashboard } from 'lucide-react';
import AppLayout from './components/layout/AppLayout.jsx';
import ProcessingPage from './pages/ProcessingPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import roayaLogo from './assets/roaya.jpg';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeView, setActiveView] = useState('processing');
  
  // ============================================================================
  // LIFTED STATE - Processing Page State
  // ============================================================================
  const [files, setFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // ============================================================================
  // NOTIFICATION STATE - Unified notification system
  // ============================================================================
  const [notifications, setNotifications] = useState([]);

  const branding = {
    logo: roayaLogo,
    companyName: 'رؤية للكمبيوتر و ملحقاته',
    primaryColor: '#3b4ba0',
    secondaryColor: '#c7369e',
    showCompanyName: false,
  };

  // Add notification helper
  const addNotification = (type, message, dismissible = true) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message, dismissible }]);
    
    // Auto-dismiss success and info messages after 5 seconds
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        dismissNotification(id);
      }, 5000);
    }
  };

  // Dismiss notification
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  if (showSplash) {
    return <SplashScreen onReady={() => setShowSplash(false)} branding={branding} />;
  }

  const renderPage = () => {
    switch (activeView) {
      case 'processing':
        return (
          <ProcessingPage
            // State props
            files={files}
            setFiles={setFiles}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            zoom={zoom}
            setZoom={setZoom}
            processing={processing}
            setProcessing={setProcessing}
            saving={saving}
            setSaving={setSaving}
            // Notification props
            notifications={notifications}
            addNotification={addNotification}
            dismissNotification={dismissNotification}
            clearNotifications={clearNotifications}
          />
        );
      case 'search':
        return <SearchPage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return (
          <ProcessingPage
            files={files}
            setFiles={setFiles}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            zoom={zoom}
            setZoom={setZoom}
            processing={processing}
            setProcessing={setProcessing}
            saving={saving}
            setSaving={setSaving}
            notifications={notifications}
            addNotification={addNotification}
            dismissNotification={dismissNotification}
            clearNotifications={clearNotifications}
          />
        );
    }
  };

  return (
    <AppLayout activeView={activeView} onViewChange={setActiveView}>
      {renderPage()}
    </AppLayout>
  );
}