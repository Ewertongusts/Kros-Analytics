<template>
  <div class="p-6 pb-2 text-center relative z-10 border-b border-white/5 bg-black/10">
    <button 
      v-if="showMinimize"
      @click="$emit('minimize')"
      class="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-all transition-colors"
      title="Minimizar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v5H3"/><path d="M21 8h-5V3"/><path d="M3 16h5v5"/><path d="M16 21v-5h5"/></svg>
    </button>

    <div class="flex items-center justify-center gap-3">
      <div class="w-10 h-10 bg-kros-blue/10 rounded-xl flex items-center justify-center text-kros-blue border border-kros-blue/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
      </div>
      <div class="text-left leading-tight">
        <h3 class="text-lg font-black uppercase tracking-tight text-white">
          ENVIAR EM <span class="text-kros-blue">MASSA</span>
        </h3>
        <p class="text-[10px] text-white/40 font-bold uppercase tracking-widest">{{ recipientCount }} destinatários</p>
      </div>
    </div>
    
    <button 
      @click="$emit('toggle-list')" 
      class="mt-4 w-full flex items-center justify-between px-4 py-2 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/5 transition-all"
    >
      <span class="text-[9px] font-black text-white/30 uppercase tracking-widest">Ver Lista de Destinatários</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform duration-300', showList ? 'rotate-180' : '']"><path d="m18 15-6-6-6 6"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  recipientCount: number
  showMinimize: boolean
  showList: boolean
}>()

defineEmits<{
  minimize: []
  'toggle-list': []
}>()
</script>
