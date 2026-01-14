import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationModal = ({
    isOpen,
    onClose,
    type = 'success', // 'success' | 'error' | 'warning' | 'info'
    title,
    message,
    autoClose = true,
    autoCloseDelay = 3000,
    showCloseButton = true,
    onConfirm,
    confirmText = 'تأكيد',
    showCancel = false,
    cancelText = 'إلغاء'
}) => {
    useEffect(() => {
        if (isOpen && autoClose && !onConfirm) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose, onConfirm]);

    if (!isOpen) return null;

    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-300',
                    iconColor: 'text-green-600',
                    iconBg: 'bg-green-100',
                    titleColor: 'text-green-900',
                    messageColor: 'text-green-800',
                    buttonColor: 'bg-green-600 hover:bg-green-700',
                };
            case 'error':
                return {
                    icon: XCircle,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-300',
                    iconColor: 'text-red-600',
                    iconBg: 'bg-red-100',
                    titleColor: 'text-red-900',
                    messageColor: 'text-red-800',
                    buttonColor: 'bg-red-600 hover:bg-red-700',
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-300',
                    iconColor: 'text-amber-600',
                    iconBg: 'bg-amber-100',
                    titleColor: 'text-amber-900',
                    messageColor: 'text-amber-800',
                    buttonColor: 'bg-amber-600 hover:bg-amber-700',
                };
            case 'info':
                return {
                    icon: Info,
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-300',
                    iconColor: 'text-blue-600',
                    iconBg: 'bg-blue-100',
                    titleColor: 'text-blue-900',
                    messageColor: 'text-blue-800',
                    buttonColor: 'bg-blue-600 hover:bg-blue-700',
                };
            default:
                return getTypeConfig('info');
        }
    };

    const config = getTypeConfig();
    const Icon = config.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                {/* Close button */}
                {showCloseButton && !onConfirm && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    </button>
                )}

                {/* Content */}
                <div className="p-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-4`}>
                        <Icon className={`w-8 h-8 ${config.iconColor}`} />
                    </div>

                    {/* Title */}
                    {title && (
                        <h3 className={`text-xl font-bold text-center mb-3 ${config.titleColor}`}>
                            {title}
                        </h3>
                    )}

                    {/* Message */}
                    {message && (
                        <p className={`text-center text-base leading-relaxed ${config.messageColor}`}>
                            {message}
                        </p>
                    )}

                    {/* Action Buttons */}
                    {onConfirm && (
                        <div className="flex gap-3 mt-6">
                            {showCancel && (
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 px-4 py-3 rounded-xl font-bold text-white ${config.buttonColor} transition-all shadow-lg hover:shadow-xl`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    )}

                    {/* Auto-close indicator */}
                    {autoClose && !onConfirm && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                                <div
                                    className={`h-full ${config.buttonColor} animate-[shrink_${autoCloseDelay}ms_linear]`}
                                    style={{
                                        animation: `shrink ${autoCloseDelay}ms linear forwards`
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
};

export default NotificationModal;