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
        :subscription-status-filter="subscriptionStatusFilter"
        @toggle-subscription-status="toggleSubscriptionStatus"
        @clear-subscription-status="clearSubscriptionStatus"
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
      @remove-tag-batch="removeTagFromBatch"
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
            v-for="payment in paginatedPayments" 
            :key="payment.id"
            :payment="payment"
            :is-compact="isCompact"
            :is-selected="selectedIds.includes(payment.id)"
            v-model:active-tag-picker="activeTagPicker"
            :tag-definitions="tagDefinitions"
            @toggle-select="toggleSelect"
            @remove-tag="removeTag"
            @add-tag="addTag"
            @edit="handleEdit"
            @toggle-status="$emit('toggle-status', $event)"
            @toggle-autobilling="toggleAutoBilling"
            @open-msg-modal="openMsgModal"
            @open-logs="$emit('open-logs', $event)"
            @open-history="$emit('open-history', $event)"
            @delete="handleDelete"
          />
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-6 px-2">
      <!-- Info da paginação -->
      <div class="flex items-center gap-3">
        <div class="text-[10px] font-bold text-white/50 uppercase tracking-widest">
          Página {{ currentPage }} de {{ totalPages }}
        </div>
        <div class="h-4 w-px bg-white/10"></div>
        <div class="text-[10px] font-bold text-white/70 uppercase tracking-widest">
          {{ filteredPayments.length }} registros
        </div>
      </div>
      
      <!-- Controles de navegação -->
      <div class="flex items-center gap-2">
        <!-- Botão Anterior -->
        <button 
          @click="prevPage"
          :disabled="!hasPrevPage"
          class="group flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-white/5 hover:border-white/10 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/50 group-hover:text-white transition-colors">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          <span class="text-[10px] font-bold text-white/50 group-hover:text-white uppercase tracking-widest transition-colors">
            Anterior
          </span>
        </button>
        
        <!-- Números das páginas -->
        <div class="flex items-center gap-1">
          <!-- Primeira página -->
          <button 
            v-if="currentPage > 3"
            @click="goToPage(1)"
            class="w-10 h-10 flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] text-white/50 hover:text-white rounded-xl border border-white/5 hover:border-white/10 transition-all"
          >
            <span class="text-[11px] font-bold">1</span>
          </button>
          
          <!-- Reticências início -->
          <div v-if="currentPage > 4" class="px-2 text-white/30 text-[11px]">...</div>
          
          <!-- Páginas próximas -->
          <button 
            v-for="page in getVisiblePages()" 
            :key="page"
            @click="goToPage(page)"
            :class="[
              'w-10 h-10 flex items-center justify-center rounded-xl border transition-all',
              page === currentPage 
                ? 'bg-kros-blue border-kros-blue text-white shadow-lg shadow-kros-blue/20' 
                : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/10 text-white/50 hover:text-white'
            ]"
          >
            <span class="text-[11px] font-bold">{{ page }}</span>
          </button>
          
          <!-- Reticências fim -->
          <div v-if="currentPage < totalPages - 3" class="px-2 text-white/30 text-[11px]">...</div>
          
          <!-- Última página -->
          <button 
            v-if="currentPage < totalPages - 2 && totalPages > 5"
            @click="goToPage(totalPages)"
            :class="[
              'w-10 h-10 flex items-center justify-center rounded-xl border transition-all',
              totalPages === currentPage 
                ? 'bg-kros-blue border-kros-blue text-white shadow-lg shadow-kros-blue/20' 
                : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-white/10 text-white/50 hover:text-white'
            ]"
          >
            <span class="text-[11px] font-bold">{{ totalPages }}</span>
          </button>
        </div>
        
        <!-- Botão Próxima -->
        <button 
          @click="nextPage"
          :disabled="!hasNextPage"
          class="group flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed rounded-xl border border-white/5 hover:border-white/10 transition-all"
        >
          <span class="text-[10px] font-bold text-white/50 group-hover:text-white uppercase tracking-widest transition-colors">
            Próxima
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white/50 group-hover:text-white transition-colors">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
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
import { ref, onMounted, watch } from 'vue'
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

const emit = defineEmits(['toggle-status', 'toggle-autobilling', 'batch-autobilling', 'batch-mark-paid', 'batch-mark-pending', 'batch-suspend', 'batch-reactivate', 'batch-cancel', 'batch-delete', 'delete-success', 'edit-subscription', 'open-logs', 'update-company-tags', 'open-history', 'update:activeSubTab', 'sync', 'config', 'export'])

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
  subscriptionStatusFilter,
  filteredPayments,
  paginatedPayments,
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
  toggleTag,
  toggleAllTags,
  clearTags,
  toggleSubscriptionStatus,
  clearSubscriptionStatus,
  handleSort,
  nextPage,
  prevPage,
  goToPage,
  resetPage
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
} = useCollectionSelection(props.payments, paginatedPayments)

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
  
  console.log('batchAction chamado:', type, 'Pagamentos selecionados:', selectedPayments.length)
  
  if (type === 'mark-paid') {
    openBatchPaidModal(selectedPayments)
  } else if (type === 'mark-pending') {
    openBatchPendingModal(selectedPayments)
  } else if (type === 'whatsapp-api') {
    const validatedPayments = await validateWhatsAppForBatch(selectedPayments)
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
  } else if (type === 'suspend') {
    const confirmed = await confirm(
      `Deseja suspender ${selectedIds.value.length} assinatura${selectedIds.value.length > 1 ? 's' : ''}? Os contratos ficarão pausados temporariamente.`,
      'Suspender Assinaturas'
    )
    if (!confirmed) return
    emit('batch-suspend', selectedPayments)
    clearSelection()
  } else if (type === 'reactivate') {
    const confirmed = await confirm(
      `Deseja reativar ${selectedIds.value.length} assinatura${selectedIds.value.length > 1 ? 's' : ''}? Os contratos voltarão ao status ativo.`,
      'Reativar Assinaturas'
    )
    if (!confirmed) return
    emit('batch-reactivate', selectedPayments)
    clearSelection()
  } else if (type === 'cancel') {
    const confirmed = await confirm(
      `⚠️ ATENÇÃO: Deseja cancelar ${selectedIds.value.length} assinatura${selectedIds.value.length > 1 ? 's' : ''}? Esta ação encerrará os contratos permanentemente.`,
      'Cancelar Assinaturas'
    )
    if (!confirmed) return
    emit('batch-cancel', selectedPayments)
    clearSelection()
  } else if (type === 'delete') {
    console.log('Emitindo evento batch-delete com', selectedPayments.length, 'assinaturas')
    emit('batch-delete', selectedPayments)
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
      // Atualizar localmente primeiro para feedback imediato
      p.tags = currentTags
      emit('update-company-tags', { companyId: p.company_id, tags: currentTags })
    }
  }

  clearSelection()
}

const removeTagFromBatch = async (tagName: string) => {
  const selectedPayments = getSelectedPayments()
  if (selectedPayments.length === 0) return

  const confirmed = await confirm(`Deseja remover a tag "${tagName}" de ${selectedPayments.length} empresas selecionadas?`, 'Remover tag')
  if (!confirmed) return

  for (const p of selectedPayments) {
    const currentTags = (p.tags || []).filter((t: string) => t !== tagName)
    // Atualizar localmente primeiro para feedback imediato
    p.tags = currentTags
    emit('update-company-tags', { companyId: p.company_id, tags: currentTags })
  }

  clearSelection()
}

const addTag = (payment: any, tagName: string) => {
  const currentTags = [...(payment.tags || [])]
  if (!currentTags.includes(tagName)) {
    currentTags.push(tagName)
    // Atualizar localmente primeiro para feedback imediato
    payment.tags = currentTags
    emit('update-company-tags', { companyId: payment.company_id, tags: currentTags })
  }
  activeTagPicker.value = null
}

const removeTag = async (payment: any, tagName: string) => {
  const confirmed = await confirm(`Deseja remover a tag "${tagName}"?`, 'Remover tag')
  if (!confirmed) return
  const currentTags = (payment.tags || []).filter((t: string) => t !== tagName)
  // Atualizar localmente primeiro para feedback imediato
  payment.tags = currentTags
  emit('update-company-tags', { companyId: payment.company_id, tags: currentTags })
}

const handleDelete = async (payment: any) => {
  const confirmed = await confirm(
    `Deseja excluir a assinatura de ${payment.company_name}? Esta ação não pode ser desfeita.`,
    'Excluir Assinatura'
  )
  if (!confirmed) return
  
  try {
    const supabase = useSupabaseClient()
    const user = useSupabaseUser()
    
    console.log('Apagando assinatura individual:', payment.id)
    
    // Excluir assinatura da tabela subscriptions
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', payment.id)
    
    if (error) throw error
    
    // Registrar no histórico
    const { error: historyError } = await supabase.from('payment_history').insert({
      payment_id: payment.id,
      company_id: payment.company_id,
      action_type: 'subscription_deleted',
      description: `Assinatura de ${payment.company_name} foi excluída (${payment.plan_name} - R$ ${payment.amount})`,
      user_id: user.value?.id,
      user_name: user.value?.email?.split('@')[0] || 'Sistema',
      metadata: {
        amount: payment.amount,
        plan_name: payment.plan_name,
        start_date: payment.start_date,
        status: payment.status,
        company_name: payment.company_name
      }
    })
    
    if (historyError) {
      console.error('Erro ao registrar no histórico:', historyError)
    }
    
    const { success } = useToast()
    success('Assinatura excluída', `Assinatura de ${payment.company_name} foi removida`)
    
    // Emitir evento com o ID para remover do array local
    emit('delete-success', payment.id)
  } catch (err: any) {
    console.error('Erro ao excluir assinatura:', err)
    const { error: errorToast } = useToast()
    errorToast('Erro ao excluir', err.message)
  }
}

const handleEdit = (payment: any) => {
  console.log('Editando assinatura:', payment)
  emit('edit-subscription', payment)
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

// Função para calcular páginas visíveis
const getVisiblePages = () => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

// Reset página quando filtros mudarem
watch([activeFilter, selectedTags, searchQuery, subscriptionStatusFilter], () => {
  resetPage()
})
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
