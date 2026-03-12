<template>
  <div v-if="show" class="space-y-6 animate-in fade-in duration-500">
    <BlocksKFinanceCollectionSummary :payments="payments" />
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BlocksKFinanceEvolutionChart :payments="payments" />
      <BlocksKFinanceDistributionChart :payments="payments" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  payments: any[]
}>()
</script>
