import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface Toast {
  id: string;
  title?: string;
  description: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

interface ToastContextType {
  toasts: Toast[];
  toast: (options: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (options: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...options, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      dismiss(id);
    }, 5000);
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg p-4 shadow-lg max-w-md ${
              t.variant === 'error'
                ? 'bg-red-500 text-white'
                : t.variant === 'success'
                ? 'bg-green-500 text-white'
                : t.variant === 'warning'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-800 text-white'
            }`}
          >
            {t.title && <div className="font-semibold mb-1">{t.title}</div>}
            <div className="text-sm">{t.description}</div>
            <button
              onClick={() => dismiss(t.id)}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
