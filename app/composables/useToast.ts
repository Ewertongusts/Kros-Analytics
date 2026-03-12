import { ref } from 'vue'

interface Toast {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  description?: string
}

const toastInstance = ref<any>(null)
const confirmInstance = ref<any>(null)

export const useToast = () => {
  const setToastInstance = (instance: any) => {
    toastInstance.value = instance
  }

  const setConfirmInstance = (instance: any) => {
    confirmInstance.value = instance
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

  const confirm = (message: string, title?: string, variant?: 'default' | 'whatsapp'): Promise<boolean> => {
    return new Promise((resolve) => {
      if (confirmInstance.value) {
        confirmInstance.value.show(message, title, resolve, variant)
      } else {
        // Fallback para confirm nativo se o componente não estiver montado
        resolve(window.confirm(message))
      }
    })
  }

  return {
    setToastInstance,
    setConfirmInstance,
    showToast,
    success,
    error,
    warning,
    info,
    confirm
  }
}
