<template>
  <div v-if="isOpen" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
    <div @click="$emit('close')" class="absolute inset-0 bg-black/90 backdrop-blur-xl"></div>
    
      <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-4xl p-6 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]">
        <div class="mb-5 flex items-center justify-between relative z-10 border-b border-white/5 pb-4">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-white/60 border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16 20h.01"/><path d="M3 14h.01"/><path d="M8 14h.01"/><path d="M3 10h.01"/><path d="M8 10h.01"/><path d="M3 6h.01"/><path d="M8 6h.01"/><rect width="18" height="18" x="3" y="3" rx="2"/></svg>
             </div>
              <div>
                 <h3 class="text-xl font-bold uppercase tracking-tight text-white">
                   Logs das <span class="text-kros-blue">Cobranças</span>
                 </h3>
                 <p class="text-xs text-white/60 font-medium uppercase tracking-[0.1em] mt-1">
                   Histórico de envios (manuais e automáticos)
                 </p>
              </div>
          </div>
          
          <button @click="$emit('close')" class="p-2 rounded-xl bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20 opacity-50 flex-1">
         <svg class="animate-spin text-white mb-4" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
         <p class="text-xs font-bold uppercase tracking-widest text-white">Buscando rastros digitais...</p>
      </div>

      <div v-else-if="logs.length === 0" class="flex flex-col items-center justify-center py-20 opacity-40 flex-1 border border-dashed border-white/10 rounded-3xl m-2">
         <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-white"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
         <h4 class="font-bold uppercase tracking-widest text-sm text-white">Vazio</h4>
         <p class="text-xs font-medium uppercase tracking-widest mt-1.5 opacity-60">Nenhum disparo detectado ainda</p>
      </div>

      <div v-else class="flex-1 overflow-y-auto pr-2 space-y-3 relative z-10 custom-scrollbar">
         
         <div v-for="log in logs" :key="log.id" class="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col gap-3">
            <div class="flex items-center justify-between">
               
               <div class="flex items-center gap-3">
                  <div :class="[
                     'w-8 h-8 rounded-xl flex items-center justify-center border',
                     log.is_cron 
                       ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                       : 'bg-kros-blue/10 text-kros-blue border-kros-blue/20'
                  ]" :title="log.is_cron ? 'Disparo Automático (CRON)' : 'Disparo Manual'">
                     <svg v-if="log.is_cron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                     <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.8A8.38 8.38 0 0 1 21 11.5Z"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M8 12h.01"/></svg>
                  </div>
                  <div>
                    <h5 class="text-sm font-semibold text-white uppercase tracking-tight">{{ log.company_name }}</h5>
                    <p class="text-xs text-white/50 font-medium tracking-tight mt-0.5">{{ log.whatsapp }}</p>
                  </div>
               </div>

               <div class="text-right flex flex-col items-end gap-1.5">
                 <p class="text-xs font-semibold text-white/60 uppercase tracking-widest">{{ formatDate(log.created_at) }}</p>
                 <span :class="[
                    'text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-xl border',
                     log.status.includes('Sucesso') || log.status.includes('Enviado') 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : (log.status.includes('Erro') ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-white/5 text-white/70 border-white/20')
                 ]">
                    {{ log.status }}
                 </span>
               </div>
            </div>

            <div class="bg-black/30 w-full p-4 rounded-xl border border-white/5 text-xs text-white/70 whitespace-pre-wrap leading-relaxed tracking-tight">
               {{ log.message_body }}
            </div>
         </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  isOpen: boolean
  paymentId?: string | null
}>()

const emit = defineEmits(['close'])

const supabase = useSupabaseClient()
const logs = ref<any[]>([])
const loading = ref(true)

const fetchLogs = async () => {
    loading.value = true
    try {
        let query = supabase
            .from('message_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100)
            
        if (props.paymentId) {
            // Tentar buscar por company_id primeiro, se não funcionar, buscar por company_name
            // Por enquanto, vamos buscar todos os logs
            console.log('🔍 [KFinanceLogsModal] Buscando logs para company_id:', props.paymentId)
        }

        const { data, error } = await query
            
        if (error) {
            console.error('❌ [KFinanceLogsModal] Erro ao buscar logs:', error)
            throw error
        }
        
        console.log('✅ [KFinanceLogsModal] Logs encontrados:', data?.length)
        logs.value = data || []
    } catch (err) {
        console.error('Erro ao buscar logs:', err)
        logs.value = []
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
