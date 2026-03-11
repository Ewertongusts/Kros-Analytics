<template>
  <div class="relative group/logstatus inline-flex">
    <button 
      @click="$emit('open-logs')"
      title="Histórico desta Cobrança"
      class="p-2.5 rounded-xl transition-all border flex items-center justify-center relative bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border-transparent hover:border-white/10"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
      
      <!-- Indicador (Bolinha) no botão se houver log -->
      <span v-if="lastLog" :class="[
          'absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-[#111112]',
          isSuccess ? 'bg-emerald-500' : 'bg-red-500'
      ]"></span>
    </button>
    
    <!-- Tooltip / Status Message -->
    <div :class="[
      'absolute -top-10 right-0 whitespace-nowrap opacity-0 group-hover/logstatus:opacity-100 transition-all duration-300 translate-y-2 group-hover/logstatus:translate-y-0 px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest pointer-events-none z-[130] border shadow-2xl backdrop-blur-md',
      !lastLog ? 'bg-black/90 text-white/40 border-white/10' :
      isSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
    ]">
      <span v-if="lastLog" class="flex items-center gap-2">
        <span class="opacity-50 tracking-[.2em]">{{ lastLog.is_cron ? 'ROBÔ:' : 'MANUAL:' }}</span>
        <span :class="isSuccess ? 'text-emerald-500' : 'text-red-500'">{{ isSuccess ? 'SUCESSO' : 'FALHOU' }}</span>
      </span>
      <span v-else class="opacity-50">NENHUM DISPARO</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  paymentId: string
}>()

const emit = defineEmits(['open-logs'])

const supabase = useSupabaseClient()
const lastLog = ref<any>(null)

const isSuccess = computed(() => {
    return lastLog.value?.status?.includes('Sucesso') || lastLog.value?.status?.includes('Enviado')
})

const fetchLastLog = async () => {
    try {
        const { data, error } = await supabase
            .from('message_logs')
            .select('*')
            .eq('payment_id', props.paymentId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
            
        if (data) {
            lastLog.value = data
        }
    } catch (err: any) {
        // Ignora caso erro, se não tem log ele só cai aqui silenciado.
    }
}

onMounted(() => {
    if (props.paymentId) fetchLastLog()
})
</script>
