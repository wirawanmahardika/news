"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="toast toast-top toast-end z-[100]">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`alert shadow-lg ${
                t.type === "success"
                  ? "alert-success"
                  : t.type === "error"
                    ? "alert-error"
                    : "alert-info"
              }`}
            >
              {t.type === "success" && <CheckCircle2 className="size-4 shrink-0" />}
              {t.type === "error" && <AlertCircle className="size-4 shrink-0" />}
              {t.type === "info" && <Info className="size-4 shrink-0" />}
              <span className="text-sm font-medium">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="btn btn-ghost btn-xs btn-circle"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
