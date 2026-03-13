import { ref, computed, unref } from 'vue'
import { isValidWhatsApp } from '~/utils/validators'

export const useCollectionSelection = (payments: any[], filteredPayments: any) => {
  const selectedIds = ref<string[]>([])
  const activeTagPicker = ref<string | null>(null)

  // Garantir que filteredPayments seja sempre um array
  const getFilteredPayments = () => {
    return unref(filteredPayments)
  }

  const isAllSelected = computed(() => {
    const filtered = getFilteredPayments()
    return filtered.length > 0 && selectedIds.value.length === filtered.length
  })

  const selectedTotal = computed(() => {
    const selected = payments.filter(p => selectedIds.value.includes(p.id))
    return selected.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
  })

  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      selectedIds.value = []
    } else {
      const filtered = getFilteredPayments()
      selectedIds.value = filtered.map(p => p.id)
    }
  }

  const toggleSelect = (id: string) => {
    const index = selectedIds.value.indexOf(id)
    if (index === -1) {
      selectedIds.value.push(id)
    } else {
      selectedIds.value.splice(index, 1)
    }
  }

  const clearSelection = () => {
    selectedIds.value = []
  }

  const getSelectedPayments = () => {
    return payments.filter(p => selectedIds.value.includes(p.id))
  }

  const validateWhatsAppForBatch = async (selectedPayments: any[]) => {
    const { confirm, warning } = useToast()
    
    const paymentsWithoutWhatsApp = selectedPayments.filter(p => !isValidWhatsApp(p.company_whatsapp))
    
    if (paymentsWithoutWhatsApp.length > 0) {
      const paymentsWithWhatsApp = selectedPayments.filter(p => isValidWhatsApp(p.company_whatsapp))
      
      const names = paymentsWithoutWhatsApp.map(p => p.company_name).join(', ')
      
      if (paymentsWithWhatsApp.length === 0) {
        warning(
          'Nenhuma empresa válida',
          `${paymentsWithoutWhatsApp.length} empresa(s) sem WhatsApp válido: ${names}`
        )
        return null
      }
      
      const confirmed = await confirm(
        `Deseja prosseguir apenas com as ${paymentsWithWhatsApp.length} empresa(s) que possuem WhatsApp válido?`,
        `${paymentsWithoutWhatsApp.length} empresa(s) sem WhatsApp válido`
      )
      
      if (confirmed) {
        const idsToRemove = paymentsWithoutWhatsApp.map(p => p.id)
        selectedIds.value = selectedIds.value.filter(id => !idsToRemove.includes(id))
        return paymentsWithWhatsApp
      }
      return null
    }
    
    return selectedPayments
  }

  return {
    selectedIds,
    activeTagPicker,
    isAllSelected,
    selectedTotal,
    toggleSelectAll,
    toggleSelect,
    clearSelection,
    getSelectedPayments,
    validateWhatsAppForBatch
  }
}
