import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function SplashScreen({ onReady, branding }) {
  const [phase, setPhase] = useState('logo'); // logo, health-check
  const [status, setStatus] = useState('initializing');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const defaultBranding = {
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
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Logo animation phase
  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setPhase('health-check');
    }, 2500); // Show Z logo for 2.5 seconds

    return () => clearTimeout(logoTimer);
  }, []);

  // Health check phase
  useEffect(() => {
    if (phase !== 'health-check') return;

    const initialize = async () => {
      setStatus('initializing');
      
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 1.5;
        });
      }, 50);

      await new Promise(resolve => setTimeout(resolve, 1500));

      setStatus('checking');
      
      let attempts = 0;
      const maxAttempts = 10;
      const checkInterval = 500;

      while (attempts < maxAttempts) {
        const isHealthy = await checkBackendHealth();
        
        if (isHealthy) {
          clearInterval(progressInterval);
          setProgress(100);
          setStatus('success');
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          onReady();
          return;
        }

        attempts++;
        setRetryCount(attempts);
        await new Promise(resolve => setTimeout(resolve, checkInterval));
      }

      clearInterval(progressInterval);
      setStatus('error');
      setErrorMessage('تعذر الاتصال بالخادم. يرجى التأكد من تشغيل الخادم.');
    };

    initialize();
  }, [phase, onReady]);

  const handleRetry = () => {
    setStatus('initializing');
    setProgress(0);
    setErrorMessage('');
    setRetryCount(0);
    window.location.reload();
  };

  // Phase 1: Animated Z Logo
  if (phase === 'logo') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
        {/* Binary rain effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={`col-${i}`}
              className="absolute top-0 text-cyan-500 opacity-20 font-mono text-sm"
              style={{
                left: `${(i * 7) + 2}%`,
                animation: `binary-fall ${3 + Math.random() * 2}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              {Array.from({ length: 20 }, () => Math.random() > 0.5 ? '1' : '0').join('\n')}
            </div>
          ))}
        </div>

        {/* Particle burst */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-0"
              style={{
                left: `${50 + (Math.random() - 0.5) * 30}%`,
                top: `${50 + (Math.random() - 0.5) * 30}%`,
                animation: `particle-float 1.5s ease-out ${0.8 + Math.random() * 0.4}s forwards`,
              }}
            />
          ))}
        </div>

        <svg width="300" height="300" viewBox="0 0 200 200" className="relative z-10">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="zGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          <path
            d="M 55 65 Q 100 58 145 62 Q 105 100 65 135 Q 100 140 148 138"
            stroke="url(#zGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#glow)"
            style={{
              strokeDasharray: 350,
              strokeDashoffset: 350,
              animation: 'draw-z 2s ease-in-out forwards',
            }}
          />

          <path
            d="M 50 55 Q 100 100 152 145"
            stroke="#06b6d4"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0"
            style={{
              strokeDasharray: 200,
              strokeDashoffset: 200,
              animation: 'slash-effect 0.8s ease-out 0.5s forwards',
            }}
          />
        </svg>

        <style>{`
          @keyframes draw-z {
            to { stroke-dashoffset: 0; }
          }
          @keyframes slash-effect {
            0% { stroke-dashoffset: 200; opacity: 0.6; }
            100% { stroke-dashoffset: 0; opacity: 0; }
          }
          @keyframes particle-float {
            0% { opacity: 0; transform: translate(0, 0) scale(0); }
            50% { opacity: 0.6; }
            100% { opacity: 0; transform: translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px) scale(1.5); }
          }
          @keyframes binary-fall {
            0% { transform: translateY(-100%); opacity: 0; }
            10% { opacity: 0.2; }
            90% { opacity: 0.2; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  // Phase 2: Health Check Screen
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center overflow-hidden animate-fade-in"
      style={{
        background: `linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)`,
      }}
    >
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

      <div className="relative z-10 text-center px-8 max-w-md">
        <div className="space-y-6">
          {status === 'success' ? (
            <div className="space-y-4">
              <div className="flex justify-center">
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
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">✓ جاهز!</h2>
                <p className="text-gray-600 text-sm">تم الاتصال بالخادم بنجاح</p>
              </div>
            </div>
          ) : status === 'error' ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">تعذر الاتصال بالنظام</h2>
                <p className="text-gray-600 text-sm mb-4">يرجى التواصل مع الدعم الفني</p>
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
            <div className="space-y-4">
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
                  {status === 'initializing' ? 'تحضير النظام' : `محاولة ${retryCount}/10`}
                </p>
              </div>

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

        <div className="mt-12 text-xs text-gray-500">
          نظام معالجة الإيصالات الآلي
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}