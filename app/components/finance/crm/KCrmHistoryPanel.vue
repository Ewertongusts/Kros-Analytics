<template>
  <div class="p-8 rounded-3xl bg-[#0D0D0E] border border-white/5 flex flex-col gap-6 shadow-2xl relative overflow-hidden h-full">
    <div class="flex items-center justify-between relative z-10">
      <div>
        <h4 class="text-[11px] font-bold text-white uppercase tracking-[0.2em]">Histórico de Conectividade</h4>
        <p class="text-[8px] text-white/30 uppercase font-black mt-1">Registros de depuração</p>
      </div>
      <div class="w-8 h-8 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-white/40">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m19 11-8-8-8 8"/><path d="M12 21V3"/></svg>
      </div>
    </div>
    
    <div v-if="logs.length === 0" class="py-12 text-center opacity-20 relative z-10">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-3 opacity-50"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></svg>
      <p class="text-[9px] font-black uppercase tracking-[0.3em]">Ambiente Limpo</p>
    </div>

    <div v-else class="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
      <div v-for="log in logs" :key="log.id" class="group flex flex-col gap-2.5 p-4 bg-white/[0.02] border border-white/5 rounded-2xl transition-all duration-300 hover:bg-white/[0.04] hover:border-white/15">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div :class="[
              'w-1.5 h-1.5 rounded-full ring-4',
              log.status.includes('Sucesso') ? 'bg-emerald-500 ring-emerald-500/10' : 'bg-red-500 ring-red-500/10'
            ]"></div>
            <span class="text-[10px] font-bold text-white tracking-tight">{{ log.whatsapp }}</span>
          </div>
          <span class="text-[8px] font-bold text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">{{ formatDate(log.created_at) }}</span>
        </div>

        <div class="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-white/5">
          <p class="text-[9px] font-semibold tracking-tight truncate max-w-[180px]" :class="log.status.includes('Sucesso') ? 'text-emerald-400/80' : 'text-red-400/80'">
            {{ log.status }}
          </p>
          <div :class="['text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md', log.status.includes('Sucesso') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500']">
            {{ log.status.includes('Sucesso') ? 'OK' : 'ERR' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Glow decorativo no fundo -->
    <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-kros-blue/5 rounded-full blur-[60px] pointer-events-none"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  logs: any[]
}>()

const formatDate = (dateValue: string) => {
  const d = new Date(dateValue)
  return d.toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', 
    hour: '2-digit', minute: '2-digit'
  }) + 'h'
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
