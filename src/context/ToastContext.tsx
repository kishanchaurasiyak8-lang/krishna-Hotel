import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastInput {
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastItem extends ToastInput {
  id: number;
}

export interface ToastContextValue {
  showToast: (toast: ToastInput) => void;
}

const TOAST_DURATION_MS = 5000;
const MAX_VISIBLE_TOASTS = 3;

export const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, { icon: typeof Info; iconClass: string; accentClass: string }> = {
  success: { icon: CheckCircle2, iconClass: 'text-emerald-600', accentClass: 'border-l-emerald-500' },
  error: { icon: AlertCircle, iconClass: 'text-red-600', accentClass: 'border-l-red-500' },
  info: { icon: Info, iconClass: 'text-gold-700', accentClass: 'border-l-gold-500' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: ToastInput) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current.slice(-(MAX_VISIBLE_TOASTS - 1)), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), TOAST_DURATION_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6"
      >
        {toasts.map((toast) => {
          const { icon: Icon, iconClass, accentClass } = toneStyles[toast.tone];
          return (
            <div
              key={toast.id}
              role={toast.tone === 'error' ? 'alert' : 'status'}
              className={`pointer-events-auto flex w-full max-w-sm animate-slide-up items-start gap-3 rounded-xl border border-l-4 border-navy-100 bg-white p-4 shadow-xl ${accentClass}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconClass}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-navy-900">{toast.title}</p>
                {toast.description && <p className="mt-0.5 text-sm text-navy-600">{toast.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-full p-1 text-navy-400 transition hover:bg-navy-50 hover:text-navy-900"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
