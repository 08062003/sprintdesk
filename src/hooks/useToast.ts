import { useToastStore } from '../store/toastStore';
import type { ToastType } from '../store/toastStore';

export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastStore();

  const toast = (
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    addToast({ type, title, message, duration });
  };

  return {
    toast,
    success: (title: string, message?: string, duration?: number) =>
      toast('success', title, message, duration),
    error: (title: string, message?: string, duration?: number) =>
      toast('error', title, message, duration),
    warning: (title: string, message?: string, duration?: number) =>
      toast('warning', title, message, duration),
    info: (title: string, message?: string, duration?: number) =>
      toast('info', title, message, duration),
    removeToast,
    clearToasts,
  };
}
