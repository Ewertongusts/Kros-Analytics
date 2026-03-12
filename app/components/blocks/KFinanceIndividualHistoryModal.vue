<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <div class="bg-[#0D0D0E] border border-white/10 w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
      
      <!-- Header -->
      <div class="px-8 py-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div>
          <h3 class="text-xl font-bold text-white tracking-tight uppercase">
            HISTÓRICO <span class="text-kros-blue">INDIVIDUAL</span>
          </h3>
          <p class="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1">
            Empresa: {{ history[0]?.companies?.name || 'Carregando...' }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="exportHistory"
            v-if="history.length > 0"
            class="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-bold text-white/60 hover:text-white transition-all"
            title="Exportar Histórico (CSV)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            EXPORTAR
          </button>
          <button @click="$emit('close')" class="p-2 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-8 max-h-[60vh] overflow-y-auto no-scrollbar">
        <div v-if="history.length > 0" class="space-y-4">
          <div v-for="item in history" :key="item.id" 
               class="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white uppercase tracking-widest">{{ formatDate(item.paid_at) }}</span>
                <span class="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase rounded-full">Liquidado</span>
              </div>
              <p class="text-[10px] text-white/40 font-medium">Vencimento original: {{ formatDate(item.due_date) }}</p>
            </div>
            
            <div class="text-right space-y-1">
              <div class="text-sm font-black text-white tabular-nums">{{ formatCurrency(item.amount) }}</div>
              <p class="text-[9px] text-white/30 uppercase tracking-tighter">{{ item.plan_name }}</p>
            </div>
          </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-10 opacity-40">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-3 text-white/40"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
           <p class="text-[10px] font-bold uppercase tracking-widest">Nenhum pagamento registrado</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-8 py-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
         <div class="text-[10px] font-bold text-white/40 uppercase tracking-widest">
            Total Recebido: <span class="text-white">{{ formatCurrency(totalAmount) }}</span>
         </div>
         <button @click="$emit('close')" class="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
            Fechar
         </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  history: any[]
}>()

const totalAmount = computed(() => {
  return props.history.reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
})

const exportHistory = () => {
  if (props.history.length === 0) return
  
  const companyName = props.history[0]?.companies?.name || 'empresa'
  const headers = ['Data Pagamento', 'Vencimento Original', 'Valor', 'Plano', 'Observacoes']
  
  const csvRows = props.history.map(item => [
    formatDate(item.paid_at),
    formatDate(item.due_date),
    item.amount,
    item.plan_name,
    (item.notes || '').replace(/,/g, ';') // Evitar quebra de colunas no CSV
  ])

  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `historico-${companyName.toLowerCase().replace(/\s+/g, '-')}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(date))
}

defineEmits(['close'])
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
