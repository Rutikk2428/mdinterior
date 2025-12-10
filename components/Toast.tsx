import React from 'react';
import { useToast } from '../store';
import { X, Check, AlertCircle, Info } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-3 p-4 rounded-lg shadow-2xl transform transition-all duration-300 animate-slide-up border
            ${toast.type === 'success' ? 'bg-black text-white border-black' : ''}
            ${toast.type === 'error' ? 'bg-white text-black border-red-500' : ''}
            ${toast.type === 'info' ? 'bg-white text-black border-gray-200' : ''}
          `}
        >
          {toast.type === 'success' && <Check size={18} className="text-white shrink-0" />}
          {toast.type === 'error' && <AlertCircle size={18} className="text-red-500 shrink-0" />}
          {toast.type === 'info' && <Info size={18} className="text-gray-900 shrink-0" />}
          
          <p className="text-sm font-medium flex-1 leading-tight">{toast.message}</p>
          
          <button 
            onClick={() => removeToast(toast.id)} 
            className={`transition-opacity shrink-0 ${toast.type === 'success' ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-black'}`}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;