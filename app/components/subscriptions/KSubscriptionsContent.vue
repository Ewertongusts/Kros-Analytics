<template>
  <div class="space-y-4 animate-in fade-in duration-500">
    <BlocksKFinanceCollectionBoard 
      v-if="activeTab === 'operational'"
      :key="'operational'"
      :active-sub-tab="activeTabModel"
      @update:active-sub-tab="handleTabUpdate"
      :payments="financialRecords" 
      @toggle-status="$emit('toggle-status', $event)" 
      @toggle-autobilling="$emit('toggle-autobilling', $event)" 
      @batch-autobilling="$emit('batch-autobilling', $event)"
      @batch-mark-paid="$emit('batch-mark-paid', $event)"
      @batch-mark-pending="$emit('batch-mark-pending', $event)"
      @open-logs="$emit('open-logs', $event)"
      @update-company-tags="$emit('update-company-tags', $event)"
      @open-history="$emit('open-history', $event)"
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
</template>

<script setup lang="ts">
const props = defineProps<{
  activeTab: string
  financialRecords: any[]
  paymentHistory: any[]
}>()

const emit = defineEmits<{
  'update:activeTab': [value: string]
  'toggle-status': [payment: any]
  'toggle-autobilling': [payment: any]
  'batch-autobilling': [payments: any[]]
  'batch-mark-paid': [payments: any[]]
  'batch-mark-pending': [payments: any[]]
  'open-logs': [paymentId?: string]
  'update-company-tags': [data: { companyId: string, tags: string[] }]
  'open-history': [companyId: string]
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
