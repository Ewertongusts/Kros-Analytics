<template>
  <button 
    @click="$emit('click')"
    :class="[
      'p-2.5 rounded-xl transition-all relative flex items-center justify-center',
      isActive 
        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-transparent'
    ]"
    title="Cobrança Automática (CRON/POST)"
  >
    <!-- Ícone de Automação / Bot -->
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 8V4H8"/>
      <rect width="16" height="12" x="4" y="8" rx="2"/>
      <path d="M2 14h2"/>
      <path d="M20 14h2"/>
      <path d="M15 13v2"/>
      <path d="M9 13v2"/>
    </svg>
    <span v-if="isActive" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#111112]"></span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  isActive?: boolean
}>()

defineEmits(['click'])
</script>
