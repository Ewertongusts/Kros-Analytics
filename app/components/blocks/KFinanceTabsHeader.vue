<template>
  <div class="flex items-center gap-1 bg-black/20 p-1 rounded-xl shadow-inner self-start">
    <button 
      @click="handleTabClick('operational')"
      :class="[
        'px-5 py-3 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer',
        activeSubTab === 'operational' 
          ? 'bg-kros-blue text-white shadow-lg' 
          : 'text-white/20 hover:text-white/60 hover:bg-white/5'
      ]"
    >
      Gestão
    </button>
    <button 
      @click="handleTabClick('history')"
      :class="[
        'px-5 py-3 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer',
        activeSubTab === 'history' 
          ? 'bg-kros-blue text-white shadow-lg' 
          : 'text-white/20 hover:text-white/60 hover:bg-white/5'
      ]"
    >
      Histórico de Pagamentos
    </button>
    <button 
      @click="handleTabClick('logs')"
      :class="[
        'px-5 py-3 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all cursor-pointer',
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
const props = defineProps<{
  activeSubTab: string
}>()

const emit = defineEmits(['update:activeSubTab'])

const handleTabClick = (tab: string) => {
  if (tab !== props.activeSubTab) {
    emit('update:activeSubTab', tab)
  }
}
</script>
