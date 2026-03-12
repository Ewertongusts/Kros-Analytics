<template>
  <BlocksKPageHeader title="Assinaturas" subtitle="Gestão de Planos Recorrentes e Cobranças Mensais">
    <template #actions>
      <button 
        @click="$emit('toggle-charts')"
        class="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-2 text-white/70 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="20" x2="12" y2="10"></line>
          <line x1="18" y1="20" x2="18" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="16"></line>
        </svg>
        <span class="text-[10px] font-bold uppercase tracking-widest">{{ showCharts ? 'Ocultar' : 'Indicadores' }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', showCharts ? 'rotate-180' : '']">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>
    </template>
  </BlocksKPageHeader>
</template>

<script setup lang="ts">
defineProps<{
  showCharts: boolean
}>()

defineEmits<{
  'toggle-charts': []
}>()
</script>
