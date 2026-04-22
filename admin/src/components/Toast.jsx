import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ToastContext = createContext(null);

let id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'success') => {
    const key = ++id;
    setToasts((prev) => [...prev, { key, message, type }]);
    setTimeout(() => remove(key), 4000);
  }, []);

  function remove(key) {
    setToasts((prev) => prev.filter((t) => t.key !== key));
  }

  return (
    <ToastContext.Provider value={add}>
      {children}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map(({ key, message, type }) => (
          <div
            key={key}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium max-w-xs animate-slide-up
              ${type === 'success' ? 'bg-white text-gray-800 border border-emerald-200' : 'bg-white text-gray-800 border border-red-200'}`}
          >
            {type === 'success'
              ? <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-px" />
              : <XCircleIcon    className="w-5 h-5 text-red-500 shrink-0 mt-px" />}
            <span className="flex-1">{message}</span>
            <button onClick={() => remove(key)} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up .2s ease; }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
