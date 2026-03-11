<template>
  <div class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group transition-all">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
      <!-- TABS INTEGRADAS -->
      <div class="flex items-center gap-1 bg-black/20 p-1 rounded-xl shadow-inner self-start">
          <button 
            @click="$emit('update:activeSubTab', 'operational')"
            :class="[
              'px-4 py-2 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all',
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
              'px-4 py-2 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all',
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
              'px-4 py-2 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all',
              activeSubTab === 'logs' 
                ? 'bg-kros-blue text-white shadow-lg' 
                : 'text-white/20 hover:text-white/60 hover:bg-white/5'
            ]"
          >
            Cobranças
          </button>
      </div>

      <div class="flex flex-wrap items-center gap-4 lg:flex-1 lg:justify-end">
          <button 
            @click="fetchLogs"
            class="p-2.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
            title="Sincronizar Logs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
          </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-20 opacity-50">
       <svg class="animate-spin text-white mb-4" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
       <p class="text-[10px] font-bold uppercase tracking-widest text-white">Buscando rastros digitais...</p>
    </div>

    <div v-else-if="logs.length === 0" class="flex flex-col items-center justify-center py-20 opacity-40 border border-dashed border-white/10 rounded-3xl">
       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-white"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
       <h4 class="font-bold uppercase tracking-widest text-xs text-white">Nenhum disparo detectado</h4>
    </div>

    <div v-else class="space-y-3">
       <div v-for="log in logs" :key="log.id" class="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
             <div class="flex items-center gap-4">
                <div :class="[
                   'w-10 h-10 rounded-2xl flex items-center justify-center border transition-all',
                   log.is_cron 
                     ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                     : 'bg-kros-blue/10 text-kros-blue border-kros-blue/20'
                ]">
                   <svg v-if="log.is_cron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                   <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.8A8.38 8.38 0 0 1 21 11.5Z"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M8 12h.01"/></svg>
                </div>
                <div>
                  <h5 class="text-sm font-bold text-white uppercase tracking-tight">{{ log.company_name }}</h5>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-[10px] text-white/40 font-bold uppercase tracking-widest">{{ log.whatsapp }}</span>
                    <span v-if="log.is_cron" class="w-1 h-1 rounded-full bg-white/10"></span>
                    <span v-if="log.is_cron" class="text-[8px] text-emerald-500 font-bold uppercase tracking-widest">Automação Sistema</span>
                    <span v-else class="text-[8px] text-kros-blue font-bold uppercase tracking-widest">Disparo Manual</span>
                  </div>
                </div>
             </div>

             <div class="flex items-center gap-4 self-end md:self-center">
               <div class="text-right">
                  <p class="text-[10px] font-bold text-white/60 uppercase tracking-widest">{{ formatDate(log.created_at) }}</p>
               </div>
               <span :class="[
                  'text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border',
                   log.status.includes('Sucesso') || log.status.includes('Enviado') 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : (log.status.includes('Erro') ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-white/5 text-white/70 border-white/20')
               ]">
                  {{ log.status }}
               </span>
             </div>
          </div>

          <div class="bg-black/40 w-full p-5 rounded-2xl border border-white/5 text-[11px] text-white/70 whitespace-pre-wrap leading-relaxed tracking-tight font-medium">
             {{ log.message_body }}
          </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  activeSubTab: string
}>()

const emit = defineEmits(['update:activeSubTab'])

const supabase = useSupabaseClient()
const logs = ref<any[]>([])
const loading = ref(true)

const fetchLogs = async () => {
    loading.value = true
    try {
        const { data, error } = await supabase
            .from('message_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)
            
        if (error) throw error
        logs.value = data || []
    } catch (err) {
        console.error('Erro ao buscar logs:', err)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchLogs()
})

const formatDate = (dateValue: string) => {
   const d = new Date(dateValue)
   return d.toLocaleString('pt-BR', { 
     day: '2-digit', month: '2-digit', year: 'numeric',
     hour: '2-digit', minute: '2-digit'
   }) + 'h'
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
