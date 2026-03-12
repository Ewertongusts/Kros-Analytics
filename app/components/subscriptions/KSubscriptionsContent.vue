<template>
  <div class="space-y-4 animate-in fade-in duration-500">
    <div v-if="activeTab === 'operational'">
      <BlocksKFinanceCollectionBoard 
        v-model:active-sub-tab="activeTabModel"
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
    </div>
    <div v-else-if="activeTab === 'history'">
      <BlocksKFinanceHistoryBoard 
        v-model:active-sub-tab="activeTabModel"
        :history="paymentHistory" 
        @sync="$emit('sync')"
        @config="$emit('config')"
      />
    </div>
    <div v-else-if="activeTab === 'logs'">
      <BlocksKFinanceLogsBoard 
        v-model:active-sub-tab="activeTabModel"
      />
    </div>
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
</script>
