<template>
  <button 
    @click="$emit('open-history')"
    title="Histórico de Pagamentos desta Empresa"
    :class="[
      'rounded-xl transition-all border flex items-center justify-center bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border-transparent hover:border-white/10',
      isCompact ? 'p-1.5' : 'p-2.5'
    ]"
  >
    <svg xmlns="http://www.w3.org/2000/svg" :width="isCompact ? 12 : 14" :height="isCompact ? 12 : 14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isCompact?: boolean
}>()

defineEmits(['open-history'])
</script>
