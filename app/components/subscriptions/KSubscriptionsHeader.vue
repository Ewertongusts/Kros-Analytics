<template>
  <BlocksKPageHeader title="Assinaturas" subtitle="Gestão de Planos Recorrentes e Cobranças Mensais">
    <template #actions>
      <div class="flex items-center gap-2">
        <button 
          @click="$emit('create-subscription')"
          class="px-4 py-2.5 bg-kros-blue hover:bg-kros-blue/80 rounded-xl transition-all flex items-center gap-2 text-white"
          title="Criar nova assinatura"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span class="text-[10px] font-bold uppercase tracking-widest">Nova Assinatura</span>
        </button>
        
        <button 
          @click="$emit('open-timeline')"
          class="px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-white/10 transition-all flex items-center gap-2 text-white/70 hover:text-white"
          title="Ver histórico de ações"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
          <span class="text-[10px] font-bold uppercase tracking-widest">Histórico</span>
        </button>
        
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
      </div>
    </template>
  </BlocksKPageHeader>
</template>

<script setup lang="ts">
defineProps<{
  showCharts: boolean
}>()

defineEmits<{
  'toggle-charts': []
  'open-timeline': []
  'create-subscription': []
}>()
</script>
