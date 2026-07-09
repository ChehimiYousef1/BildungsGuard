import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertTriangle, X, Info, AlertCircle } from 'lucide-react';
import { C } from '../theme/tokens';

// ===== Types =====
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextValue {
  notify: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error:   (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info:    (message: string, title?: string) => void;
}

// ===== Context =====
const ToastCtx = createContext<ToastContextValue | null>(null);
export const useToast = () => useContext(ToastCtx)!;

// ===== Colors =====
const TOAST_META: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
  success: { bg: '#F0FDF4', border: '#86EFAC', icon: <CheckCircle2 size={18} color="#16A34A" />, label: '#16A34A' },
  error:   { bg: '#FFF1F2', border: '#FCA5A5', icon: <AlertCircle  size={18} color="#DC2626" />, label: '#DC2626' },
  warning: { bg: '#FFFBEB', border: '#FCD34D', icon: <AlertTriangle size={18} color="#D97706" />, label: '#D97706' },
  info:    { bg: '#EFF6FF', border: '#93C5FD', icon: <Info          size={18} color="#2563EB" />, label: '#2563EB' },
};

// ===== Toast Item =====
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const meta = TOAST_META[toast.type];
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '12px 14px',
      background: meta.bg,
      border: `1.5px solid ${meta.border}`,
      borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
      minWidth: 300, maxWidth: 400,
      animation: 'slideIn 0.25s ease',
      position: 'relative',
    }}>
      <div style={{ flexShrink: 0, marginTop: 1 }}>{meta.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div style={{ fontWeight: 700, fontSize: 13.5, color: meta.label, marginBottom: 2 }}>
            {toast.title}
          </div>
        )}
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
          {toast.message}
        </div>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#9CA3AF', flexShrink: 0, marginTop: 1 }}>
        <X size={14} />
      </button>
    </div>
  );
}

// ===== Provider =====
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const remove = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const notify = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message, title }]);
    timers.current[id] = setTimeout(() => remove(id), 4000);
  }, [remove]);

  const success = useCallback((msg: string, title?: string) => notify(msg, 'success', title), [notify]);
  const error   = useCallback((msg: string, title?: string) => notify(msg, 'error',   title), [notify]);
  const warning = useCallback((msg: string, title?: string) => notify(msg, 'warning', title), [notify]);
  const info    = useCallback((msg: string, title?: string) => notify(msg, 'info',    title), [notify]);

  return (
    <ToastCtx.Provider value={{ notify, success, error, warning, info }}>
      {children}

      {/* Toast Container */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'all' }}>
            <ToastItem toast={toast} onRemove={remove} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}
