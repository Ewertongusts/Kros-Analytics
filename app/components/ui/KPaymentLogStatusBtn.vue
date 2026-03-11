<template>
  <div class="flex flex-col items-center justify-center gap-1 group relative">
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
      'absolute -top-8 right-0 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest pointer-events-none z-10',
      !lastLog ? 'bg-white/10 text-white/50 border border-white/10' :
      isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10' : 'bg-red-500/20 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/10'
    ]">
      <span v-if="lastLog">{{ lastLog.is_cron ? 'ROBÔ:' : 'MANUAL:' }} {{ isSuccess ? 'SUCESSO' : 'FALHOU' }}</span>
      <span v-else>NENHUM DISPARO</span>
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
