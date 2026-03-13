import { ref } from 'vue'

const activeModals = ref<Set<string>>(new Set())

export const useFilterModals = (modalId: string) => {
  const isOpen = ref(false)

  const openModal = () => {
    // Fechar todos os outros modais
    const othersToClose = Array.from(activeModals.value).filter(id => id !== modalId)
    othersToClose.forEach(id => {
      window.dispatchEvent(new CustomEvent('close-filter-modal', { detail: { modalId: id } }))
    })
    
    activeModals.value.clear()
    activeModals.value.add(modalId)
    isOpen.value = true
  }

  const closeModal = () => {
    activeModals.value.delete(modalId)
    isOpen.value = false
  }

  const toggleModal = () => {
    if (isOpen.value) {
      closeModal()
    } else {
      openModal()
    }
  }

  // Escutar evento de fechamento
  if (process.client) {
    const handleCloseEvent = (event: any) => {
      if (event.detail.modalId === modalId && isOpen.value) {
        closeModal()
      }
    }
    
    window.addEventListener('close-filter-modal', handleCloseEvent)
  }

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  }
}
