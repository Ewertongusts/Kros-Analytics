<template>
  <div class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/5 transition-all">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
      <!-- TABS INTEGRADAS -->
      <BlocksKFinanceTabsHeader 
        :active-sub-tab="activeSubTab"
        @update:active-sub-tab="$emit('update:activeSubTab', $event)"
      />

      <!-- FILTROS -->
      <BlocksKFinanceCollectionFilters
        :total-count="filteredPayments.length"
        :search-query="searchQuery"
        @update:search-query="searchQuery = $event"
        :selected-tags="selectedTags"
        :tag-definitions="tagDefinitions"
        @toggle-tag="toggleTag"
        @toggle-all-tags="toggleAllTags(tagDefinitions.map(t => t.name))"
        @clear-tags="clearTags"
        :active-filter="activeFilter"
        @update:active-filter="activeFilter = $event"
        :filter-options="filterOptions"
        :is-compact="isCompact"
        @toggle-compact="isCompact = !isCompact"
        @config="$emit('config')"
        @sync="$emit('sync')"
        @export="handleExportDebug"
      />
    </div>

    <!-- Seleção em Massa - Linha Separada -->
    <BlocksKFinanceBatchActionsBar
      :selected-ids="selectedIds"
      :selected-total="selectedTotal"
      :tag-definitions="tagDefinitions"
      @batch-action="batchAction"
      @add-tag-batch="addTagToBatch"
      @clear-selection="clearSelection"
    />

    <div class="overflow-x-auto overflow-y-visible no-scrollbar">
      <table class="w-full min-w-[1000px] text-left border-separate" :class="isCompact ? 'border-spacing-y-1' : 'border-spacing-y-3'">
        <FinanceCollectionKCollectionTableHeader
          :is-compact="isCompact"
          :is-all-selected="isAllSelected"
          :sort-column="sortColumn"
          :sort-direction="sortDirection"
          @toggle-select-all="toggleSelectAll"
          @sort="handleSort"
        />
        <tbody>
          <BlocksKFinanceCollectionTableRow 
            v-for="payment in filteredPayments" 
            :key="payment.id"
            :payment="payment"
            :is-compact="isCompact"
            :is-selected="selectedIds.includes(payment.id)"
            v-model:active-tag-picker="activeTagPicker"
            :tag-definitions="tagDefinitions"
            @toggle-select="toggleSelect"
            @remove-tag="removeTag"
            @add-tag="addTag"
            @toggle-status="$emit('toggle-status', $event)"
            @toggle-autobilling="toggleAutoBilling"
            @open-msg-modal="openMsgModal"
            @open-logs="$emit('open-logs', $event)"
            @open-history="$emit('open-history', $event)"
          />
        </tbody>
      </table>
    </div>

    <div v-if="payments.length === 0" class="flex flex-col items-center justify-center py-20 opacity-60">
       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
       <p class="font-bold uppercase tracking-widest text-[10px] text-white/60">Nenhum pagamento registrado</p>
    </div>

    <!-- Modal de Envio via API HTTP -->
    <BlocksKFinanceSendMsgModal 
      v-if="isMsgModalOpen"
      :is-open="isMsgModalOpen"
      :payment="selectedPayment"
      @close="isMsgModalOpen = false"
      @sent="handleMessageSent"
    />

    <!-- Modal de Envio em Massa via API HTTP -->
    <BlocksKFinanceBatchMsgModal 
      v-if="isBatchMsgModalOpen"
      :is-open="isBatchMsgModalOpen"
      :payments="selectedPaymentsForBatch"
      @close="isBatchMsgModalOpen = false"
      @sent="handleBatchSent"
    />

    <!-- Modal de Confirmação de Pagamento em Massa -->
    <BlocksKFinanceBatchPaidModal 
      :is-open="isBatchPaidModalOpen"
      :payments="selectedPaymentsForBatch"
      @close="isBatchPaidModalOpen = false"
      @confirm="confirmBatchPaid"
    />

    <!-- Modal de Confirmação de Estorno em Massa -->
    <BlocksKFinanceBatchPendingModal 
      :is-open="isBatchPendingModalOpen"
      :payments="selectedPaymentsForBatch"
      @close="isBatchPendingModalOpen = false"
      @confirm="confirmBatchPending"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTags } from '~/composables/useTags'
import { useCollectionFilters } from '~/composables/useCollectionFilters'
import { useCollectionSelection } from '~/composables/useCollectionSelection'
import { useCollectionBatchActions } from '~/composables/useCollectionBatchActions'
import { isValidWhatsApp } from '~/utils/validators'

const { confirm } = useToast()

const props = defineProps<{
  payments: any[],
  activeSubTab: string
}>()

const emit = defineEmits(['toggle-status', 'toggle-autobilling', 'batch-autobilling', 'batch-mark-paid', 'batch-mark-pending', 'open-logs', 'update-company-tags', 'open-history', 'update:activeSubTab', 'sync', 'config', 'export'])

const handleExportDebug = (format: any) => {
  emit('export', format)
}

const isMsgModalOpen = ref(false)
const selectedPayment = ref<any>(null)
const { tags: tagDefinitions, fetchTags } = useTags()
const isCompact = ref(true)

// Composables
const {
  activeFilter,
  selectedTags,
  searchQuery,
  sortColumn,
  sortDirection,
  filterOptions,
  filteredPayments,
  toggleTag,
  toggleAllTags,
  clearTags,
  handleSort
} = useCollectionFilters(props.payments)

const {
  selectedIds,
  activeTagPicker,
  isAllSelected,
  selectedTotal,
  toggleSelectAll,
  toggleSelect,
  clearSelection,
  getSelectedPayments,
  validateWhatsAppForBatch
} = useCollectionSelection(props.payments, filteredPayments.value)

const {
  isBatchMsgModalOpen,
  isBatchPaidModalOpen,
  isBatchPendingModalOpen,
  selectedPaymentsForBatch,
  openBatchMsgModal,
  openBatchPaidModal,
  openBatchPendingModal,
  closeBatchModals
} = useCollectionBatchActions()

const batchAction = async (type: string) => {
  const selectedPayments = getSelectedPayments()
  
  if (type === 'mark-paid') {
    openBatchPaidModal(selectedPayments)
  } else if (type === 'mark-pending') {
    openBatchPendingModal(selectedPayments)
  } else if (type === 'whatsapp-api') {
    const validatedPayments = validateWhatsAppForBatch(selectedPayments)
    if (validatedPayments) {
      openBatchMsgModal(validatedPayments)
    }
  } else if (type === 'auto-billing-on') {
    emit('batch-autobilling', selectedPayments)
  } else if (type === 'auto-billing-off') {
    const confirmed = await confirm(`Deseja desativar a cobrança automática para as ${selectedIds.value.length} empresas selecionadas?`, 'Desativar cobrança automática')
    if (!confirmed) return
    for (const p of selectedPayments) {
      emit('toggle-autobilling', p)
    }
    clearSelection()
  }
}

const confirmBatchPaid = () => {
  emit('batch-mark-paid', selectedPaymentsForBatch.value)
  closeBatchModals()
  clearSelection()
}

const confirmBatchPending = () => {
  emit('batch-mark-pending', selectedPaymentsForBatch.value)
  closeBatchModals()
  clearSelection()
}

const addTagToBatch = async (tagName: string) => {
  const selectedPayments = getSelectedPayments()
  if (selectedPayments.length === 0) return

  const confirmed = await confirm(`Deseja adicionar a tag "${tagName}" para as ${selectedPayments.length} empresas selecionadas?`, 'Adicionar tag')
  if (!confirmed) return

  for (const p of selectedPayments) {
    const currentTags = [...(p.tags || [])]
    if (!currentTags.includes(tagName)) {
      currentTags.push(tagName)
      emit('update-company-tags', { companyId: p.company_id, tags: currentTags })
    }
  }

  clearSelection()
}

const addTag = (payment: any, tagName: string) => {
  const currentTags = [...(payment.tags || [])]
  if (!currentTags.includes(tagName)) {
    currentTags.push(tagName)
    emit('update-company-tags', { companyId: payment.company_id, tags: currentTags })
  }
  activeTagPicker.value = null
}

const removeTag = async (payment: any, tagName: string) => {
  const confirmed = await confirm(`Deseja remover a tag "${tagName}"?`, 'Remover tag')
  if (!confirmed) return
  const currentTags = (payment.tags || []).filter((t: string) => t !== tagName)
  emit('update-company-tags', { companyId: payment.company_id, tags: currentTags })
}

onMounted(() => {
  fetchTags()
})

const openMsgModal = (payment: any) => {
  if (!isValidWhatsApp(payment.company_whatsapp)) {
    alert('Empresa sem WhatsApp válido cadastrado. Não será possível enviar mensagem.')
    return
  }
  selectedPayment.value = payment
  isMsgModalOpen.value = true
}

const handleMessageSent = () => {
  isMsgModalOpen.value = false
  emit('sync')
}

const handleBatchSent = () => {
  closeBatchModals()
  clearSelection()
  emit('sync')
}

const toggleAutoBilling = (payment: any) => {
  emit('toggle-autobilling', payment)
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
