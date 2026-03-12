import { ref } from 'vue'

interface Toast {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  description?: string
}

const toastInstance = ref<any>(null)

export const useToast = () => {
  const setToastInstance = (instance: any) => {
    toastInstance.value = instance
  }

  const showToast = (toast: Toast) => {
    if (toastInstance.value) {
      toastInstance.value.addToast(toast)
    }
  }

  const success = (message: string, description?: string) => {
    showToast({ type: 'success', message, description })
  }

  const error = (message: string, description?: string) => {
    showToast({ type: 'error', message, description })
  }

  const warning = (message: string, description?: string) => {
    showToast({ type: 'warning', message, description })
  }

  const info = (message: string, description?: string) => {
    showToast({ type: 'info', message, description })
  }

  return {
    setToastInstance,
    showToast,
    success,
    error,
    warning,
    info
  }
}
