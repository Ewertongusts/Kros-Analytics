import { ref } from 'vue'

export const useConfirmDelete = () => {
  const isOpen = ref(false)
  const message = ref('')
  let resolveCallback: ((value: boolean) => void) | null = null

  const confirm = (msg: string): Promise<boolean> => {
    return new Promise((resolve) => {
      message.value = msg
      resolveCallback = resolve
      isOpen.value = true
    })
  }

  const handleConfirm = () => {
    isOpen.value = false
    if (resolveCallback) {
      resolveCallback(true)
      resolveCallback = null
    }
  }

  const handleCancel = () => {
    isOpen.value = false
    if (resolveCallback) {
      resolveCallback(false)
      resolveCallback = null
    }
  }

  return {
    isOpen,
    message,
    confirm,
    handleConfirm,
    handleCancel
  }
}
