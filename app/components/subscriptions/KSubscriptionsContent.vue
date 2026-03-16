<template>
  <div class="space-y-4">
    <!-- Tabs + Filtros + Botões -->
    <div class="flex items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
      <!-- Abas -->
      <div class="flex items-center gap-2">
        <button
          @click="activeTabModel = 'operational'"
          :class="[
            'px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2',
            activeTabModel === 'operational'
              ? 'border-b-2 transition-colors'
              : 'text-white/50 border-transparent hover:text-white'
          ]"
          :style="activeTabModel === 'operational' ? { color: `var(--kros-blue, #007BFF)`, borderColor: `var(--kros-blue, #007BFF)` } : {}"
        >
          Gestão
        </button>
        <button
          @click="activeTabModel = 'history'"
          :class="[
            'px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2',
            activeTabModel === 'history'
              ? 'border-b-2 transition-colors'
              : 'text-white/50 border-transparent hover:text-white'
          ]"
          :style="activeTabModel === 'history' ? { color: `var(--kros-blue, #007BFF)`, borderColor: `var(--kros-blue, #007BFF)` } : {}"
        >
          Faturas
        </button>
        <button
          @click="activeTabModel = 'logs'"
          :class="[
            'px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2',
            activeTabModel === 'logs'
              ? 'border-b-2 transition-colors'
              : 'text-white/50 border-transparent hover:text-white'
          ]"
          :style="activeTabModel === 'logs' ? { color: `var(--kros-blue, #007BFF)`, borderColor: `var(--kros-blue, #007BFF)` } : {}"
        >
          Cobranças
        </button>
      </div>

      <!-- Botões da direita -->
      <div class="flex items-center gap-2">
        <button 
          @click="$emit('toggle-charts')"
          class="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-2 text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-widest"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="20" x2="12" y2="10"></line>
            <line x1="18" y1="20" x2="18" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="16"></line>
          </svg>
          {{ showCharts ? 'Ocultar' : 'Indicadores' }}
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', showCharts ? 'rotate-180' : '']">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
        
        <button 
          @click="$emit('open-timeline')"
          class="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-2 text-white/70 hover:text-white text-[10px] font-bold uppercase tracking-widest"
          title="Ver histórico de ações"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
          Histórico
        </button>
        
        <button 
          @click="$emit('create-subscription')"
          class="px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest"
          :style="{ backgroundColor: `var(--kros-blue, #007BFF)` }"
          title="Criar nova assinatura"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Nova Assinatura
        </button>
      </div>
    </div>

    <!-- Indicadores (Gráficos) - Colapsável -->
    <div v-if="showCharts" class="animate-in fade-in duration-500">
      <BlocksKFinanceCollectionSummary :payments="financialRecords" />
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <BlocksKFinanceEvolutionChart :payments="financialRecords" />
        <BlocksKFinanceDistributionChart :payments="financialRecords" />
      </div>
    </div>

    <!-- Content -->
    <div class="animate-in fade-in duration-500">
      <BlocksKFinanceCollectionBoard 
        v-if="activeTab === 'operational'"
        :key="'operational'"
        :active-sub-tab="activeTabModel"
        @update:active-sub-tab="handleTabUpdate"
        :payments="financialRecords" 
        @toggle-status="$emit('toggle-status', $event)" 
        @toggle-autobilling="$emit('toggle-autobilling', $event)" 
        @batch-autobilling="$emit('batch-autobilling', $event)"
        @batch-delete="$emit('batch-delete', $event)"
        @delete-success="$emit('delete-success', $event)"
        @edit-subscription="$emit('edit-subscription', $event)"
        @open-logs="$emit('open-logs', $event)"
        @update-company-tags="$emit('update-company-tags', $event)"
        @open-history="$emit('open-history', $event)"
        @batch-tag-progress="$emit('batch-tag-progress', $event)"
        @open-client-details="$emit('open-client-details', $event)"
        @open-plan-details="$emit('open-plan-details', $event)"
        @update-payments="$emit('update-payments', $event)"
        @sync="$emit('sync')"
        @config="$emit('config')"
        @export="$emit('export', $event)"
      />
      <BlocksKFinanceHistoryBoard 
        v-else-if="activeTab === 'history'"
        :key="'history'"
        :active-sub-tab="activeTabModel"
        @update:active-sub-tab="handleTabUpdate"
        :history="paymentHistory"
        :selected-ids="selectedHistoryIds"
        @pay="$emit('pay', $event)"
        @reverse="$emit('reverse', $event)"
        @open-client-details="$emit('open-client-details', $event)"
        @toggle-select="$emit('toggle-history-select', $event)"
        @batch-pay="$emit('batch-pay-history')"
        @batch-reverse="$emit('batch-reverse-history')"
        @clear-selection="$emit('clear-history-selection')"
        @sync="$emit('sync')"
        @config="$emit('config')"
      />
      <BlocksKFinanceLogsBoard 
        v-else-if="activeTab === 'logs'"
        :key="'logs'"
        :active-sub-tab="activeTabModel"
        @update:active-sub-tab="handleTabUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  activeTab: string
  financialRecords: any[]
  paymentHistory: any[]
  showCharts: boolean
  selectedHistoryIds: string[]
}>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
  'toggle-status': [payment: any]
  'toggle-autobilling': [payment: any]
  'batch-autobilling': [payments: any[]]
  'batch-delete': [payments: any[]]
  'delete-success': [id: string]
  'edit-subscription': [subscription: any]
  'open-logs': [paymentId?: string]
  'update-company-tags': [data: { companyId: string, tags: string[] }]
  'open-history': [companyId: string]
  'batch-tag-progress': [data: any]
  'create-subscription': []
  'open-timeline': []
  'toggle-charts': []
  'open-client-details': [payment: any]
  'open-plan-details': [payment: any]
  'update-payments': [payments: any[]]
  'pay': [payment: any]
  'reverse': [payment: any]
  'toggle-history-select': [id: string]
  'batch-pay-history': []
  'batch-reverse-history': []
  'clear-history-selection': []
  sync: []
  config: []
  export: [format: string]
}>()

const activeTabModel = computed({
  get: () => props.activeTab,
  set: (value) => emit('update:activeTab', value)
})

const handleTabUpdate = (newTab: string) => {
  console.log('KSubscriptionsContent - Tab update received:', newTab)
  emit('update:activeTab', newTab)
}
</script>
