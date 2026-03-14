import { ref, computed } from 'vue'

// Estado global para rastrear modais abertos
const globalActiveModals = ref<Map<string, boolean>>(new Map())

export const useFilterModals = (modalId: string) => {
  // Usar o estado global em vez de criar um novo ref local
  if (!globalActiveModals.value.has(modalId)) {
    globalActiveModals.value.set(modalId, false)
  }

  const isOpen = computed(() => globalActiveModals.value.get(modalId) ?? false)

  const openModal = () => {
    // Fechar todos os outros modais
    globalActiveModals.value.forEach((_, id) => {
      if (id !== modalId) {
        globalActiveModals.value.set(id, false)
      }
    })
    
    globalActiveModals.value.set(modalId, true)
  }

  const closeModal = () => {
    globalActiveModals.value.set(modalId, false)
  }

  const toggleModal = () => {
    if (isOpen.value) {
      closeModal()
    } else {
      openModal()
    }
  }

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  }
}
