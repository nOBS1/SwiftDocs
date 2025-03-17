"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// 定义Toast组件的属性类型
export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'>, VariantProps<typeof toastVariants> {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// 创建一个上下文来管理toast
const ToastContext = React.createContext<{
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, "id">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<ToastProps>) => void;
}>({
  toasts: [],
  addToast: () => "",
  removeToast: () => {},
  updateToast: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const updateToast = React.useCallback((id: string, toast: Partial<ToastProps>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...toast } : t))
    );
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
    </ToastContext.Provider>
  );
};

const ToastViewport: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  );
};

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast: React.FC<ToastProps> = ({ 
  className, 
  variant, 
  id, 
  title, 
  description, 
  action, 
  open = true, 
  onOpenChange,
  ...props 
}) => {
  const [isOpen, setIsOpen] = React.useState(open);
  
  React.useEffect(() => {
    setIsOpen(open);
    onOpenChange?.(open);
  }, [open, onOpenChange]);
  
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
        onOpenChange?.(false);
      }, 5000); // 5秒后自动关闭
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onOpenChange]);
  
  if (!isOpen) return null;
  
  return (
    <div
      className={cn(toastVariants({ variant }), className)}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    />
  );
};

const ToastAction: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ 
  className, 
  children,
  ...props 
}) => {
  return (
    <button
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const ToastClose: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ 
  className, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  );
};

const ToastTitle: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  ...props 
}) => {
  return (
    <div
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  );
};

const ToastDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  ...props 
}) => {
  return (
    <div
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  );
};

export type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastViewport,
};