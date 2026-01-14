import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const SplashScreen = ({ onReady, branding }) => {
  const [status, setStatus] = useState('initializing'); // initializing, checking, ready, success, error
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Default branding (can be overridden via props)
  const defaultBranding = {
    logo: null, // Will show app name if no logo
    companyName: 'نظام معالجة الإيصالات',
    primaryColor: '#0d9488',
    secondaryColor: '#14b8a6',
  };

  const brand = { ...defaultBranding, ...branding };

  // Health check function
  const checkBackendHealth = async () => {
    try {
      const response = await fetch('http://localhost:8000/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  // Initialize app
  useEffect(() => {
    const initialize = async () => {
      // Phase 1: Show branding (minimum 1.5 seconds)
      setStatus('initializing');
      
      // Smooth progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1.5;
        });
      }, 50);

      // Wait minimum display time
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Phase 2: Check backend health
      setStatus('checking');
      
      let attempts = 0;
      const maxAttempts = 10;
      const checkInterval = 500; // Check every 500ms

      while (attempts < maxAttempts) {
        const isHealthy = await checkBackendHealth();
        
        if (isHealthy) {
          clearInterval(progressInterval);
          setProgress(100);
          setStatus('success');
          
          // Display success state with logo animation for 2 seconds
          await new Promise(resolve => setTimeout(resolve, 2000));
          onReady();
          return;
        }

        attempts++;
        setRetryCount(attempts);
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }

      // Failed to connect after max attempts
      clearInterval(progressInterval);
      setStatus('error');
      setErrorMessage('تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الخادم.');
    };

    initialize();
  }, [onReady]);

  // Manual retry
  const handleRetry = () => {
    setStatus('initializing');
    setProgress(0);
    setErrorMessage('');
    setRetryCount(0);
    window.location.reload();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)`,
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-0 -left-4 w-72 h-72 rounded-full opacity-30 blur-3xl animate-pulse"
          style={{ backgroundColor: brand.primaryColor }}
        />
        <div 
          className="absolute bottom-0 -right-4 w-96 h-96 rounded-full opacity-25 blur-3xl animate-pulse"
          style={{ 
            backgroundColor: brand.secondaryColor,
            animationDelay: '1s'
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-8 max-w-md">
        {/* Logo or App Name */}
        <div className={`mb-8 ${status !== 'success' ? 'animate-fade-in' : 'hidden'}`}>
          {brand.logo ? (
            <div className="flex flex-col items-center gap-4">
              {/* Logo with proper styling for the Roaya eye logo */}
              <div className="relative">
                <img 
                  src={brand.logo} 
                  alt={brand.companyName}
                  className="h-32 w-auto mx-auto object-contain drop-shadow-xl"
                  style={{
                    filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.15))'
                  }}
                />
              </div>
              
              {/* Optional: Display company name below logo */}
              {brand.showCompanyName && (
                <h1 
                  className="text-2xl font-bold"
                  style={{ color: brand.primaryColor }}
                >
                  {brand.companyName}
                </h1>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: brand.primaryColor }}
              >
                <svg 
                  className="w-12 h-12 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
              </div>
              <h1 
                className="text-2xl font-bold"
                style={{ color: brand.primaryColor }}
              >
                {brand.companyName}
              </h1>
            </div>
          )}
        </div>

        {/* Status Display */}
        <div className="space-y-6">
          {status === 'success' ? (
            // Success state - Display logo with celebration animation
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-center">
                {brand.logo ? (
                  <div className="relative animate-bounce">
                    <img 
                      src={brand.logo} 
                      alt={brand.companyName}
                      className="h-64 w-auto mx-auto object-contain drop-shadow-2xl"
                      style={{
                        filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.2))'
                      }}
                    />
                  </div>
                ) : (
                  <div 
                    className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce"
                    style={{ backgroundColor: brand.primaryColor }}
                  >
                    <svg 
                      className="w-20 h-20 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                      />
                    </svg>
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  ✓ جاهز!
                </h2>
                <p className="text-gray-600 text-sm">
                  تم الاتصال بالخادم بنجاح
                </p>
              </div>
            </div>
          ) : status === 'error' ? (
            // Error state - User-friendly version
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  تعذر الاتصال بالنظام
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  يرجى التواصل مع الدعم الفني
                </p>
              </div>

              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                style={{ backgroundColor: brand.primaryColor }}
              >
                <RefreshCw className="w-5 h-5" />
                إعادة المحاولة
              </button>
            </div>
          ) : (
            // Loading state
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-center">
                <Loader2 
                  className="w-12 h-12 animate-spin"
                  style={{ color: brand.primaryColor }}
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  {status === 'initializing' ? 'جاري التحميل...' : 'جاري الاتصال بالخادم...'}
                </h2>
                <p className="text-sm text-gray-600">
                  {status === 'initializing' 
                    ? 'تحضير النظام'
                    : `محاولة ${retryCount}/10`
                  }
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: brand.primaryColor
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-xs text-gray-500 animate-fade-in" style={{ animationDelay: '300ms' }}>
          نظام معالجة الإيصالات الآلي
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;