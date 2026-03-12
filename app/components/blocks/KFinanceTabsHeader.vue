<template>
  <div class="flex items-center gap-1 bg-black/20 p-1 rounded-xl shadow-inner self-start">
    <button 
      @click="$emit('update:activeSubTab', 'operational')"
      :class="[
        'px-5 py-3 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all',
        activeSubTab === 'operational' 
          ? 'bg-kros-blue text-white shadow-lg' 
          : 'text-white/20 hover:text-white/60 hover:bg-white/5'
      ]"
    >
      Gestão
    </button>
    <button 
      @click="$emit('update:activeSubTab', 'history')"
      :class="[
        'px-5 py-3 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all',
        activeSubTab === 'history' 
          ? 'bg-kros-blue text-white shadow-lg' 
          : 'text-white/20 hover:text-white/60 hover:bg-white/5'
      ]"
    >
      Histórico de Pagamentos
    </button>
    <button 
      @click="$emit('update:activeSubTab', 'logs')"
      :class="[
        'px-5 py-3 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all',
        activeSubTab === 'logs' 
          ? 'bg-kros-blue text-white shadow-lg' 
          : 'text-white/20 hover:text-white/60 hover:bg-white/5'
      ]"
    >
      Cobranças
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeSubTab: string
}>()

defineEmits(['update:activeSubTab'])
</script>
