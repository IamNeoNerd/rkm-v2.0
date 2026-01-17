"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

// Toast types
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id">) => void;
    removeToast: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

// Toast styles by type
const toastStyles: Record<ToastType, { bgColor: string; borderColor: string; iconColor: string; icon: React.ReactNode }> = {
    success: {
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        iconColor: "text-green-500",
        icon: <CheckCircle className="h-5 w-5" />,
    },
    error: {
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconColor: "text-red-500",
        icon: <AlertCircle className="h-5 w-5" />,
    },
    warning: {
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        iconColor: "text-yellow-500",
        icon: <AlertTriangle className="h-5 w-5" />,
    },
    info: {
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconColor: "text-blue-500",
        icon: <Info className="h-5 w-5" />,
    },
};

// Individual Toast Component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    const styles = toastStyles[toast.type];

    React.useEffect(() => {
        const duration = toast.duration || 5000;
        const timer = setTimeout(onRemove, duration);
        return () => clearTimeout(timer);
    }, [toast.duration, onRemove]);

    return (
        <div
            className={`
                flex items-start gap-3 p-4 rounded-lg border shadow-lg
                ${styles.bgColor} ${styles.borderColor}
                animate-in slide-in-from-right-full duration-300
            `}
            role="alert"
        >
            <span className={styles.iconColor}>{styles.icon}</span>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{toast.title}</p>
                {toast.message && (
                    <p className="text-sm text-gray-600 mt-0.5">{toast.message}</p>
                )}
            </div>
            <button
                onClick={onRemove}
                className="text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
                </div>
            ))}
        </div>
    );
}

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts((prev) => [...prev, { ...toast, id }]);
    }, []);

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = React.useCallback(
        (title: string, message?: string) => addToast({ type: "success", title, message }),
        [addToast]
    );

    const error = React.useCallback(
        (title: string, message?: string) => addToast({ type: "error", title, message }),
        [addToast]
    );

    const warning = React.useCallback(
        (title: string, message?: string) => addToast({ type: "warning", title, message }),
        [addToast]
    );

    const info = React.useCallback(
        (title: string, message?: string) => addToast({ type: "info", title, message }),
        [addToast]
    );

    const contextValue = React.useMemo(
        () => ({ toasts, addToast, removeToast, success, error, warning, info }),
        [toasts, addToast, removeToast, success, error, warning, info]
    );

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

// Hook to use toast
export function useToast() {
    const context = React.useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}

// Standalone toast function (for use outside React components)
let globalToast: ToastContextType | null = null;

export function setGlobalToast(toast: ToastContextType) {
    globalToast = toast;
}

export const toast = {
    success: (title: string, message?: string) => globalToast?.success(title, message),
    error: (title: string, message?: string) => globalToast?.error(title, message),
    warning: (title: string, message?: string) => globalToast?.warning(title, message),
    info: (title: string, message?: string) => globalToast?.info(title, message),
};
