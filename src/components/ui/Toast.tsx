import React from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <XCircle className="w-5 h-5 text-danger" />,
    info: <Info className="w-5 h-5 text-primary" />
  };

  const bgColors = {
    success: 'bg-green-50 border-success',
    error: 'bg-red-50 border-danger',
    info: 'bg-blue-50 border-primary'
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-lg ${bgColors[type]} animate-slide-in`}>
      {icons[type]}
      <p className="text-sm font-medium text-gray-700 flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
  }>;
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}
