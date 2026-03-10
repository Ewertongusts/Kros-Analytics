<template>
  <div class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/5 transition-all">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="font-bold text-lg text-white">Board de Cobrança</h3>
        <p class="text-[10px] text-white/50 uppercase tracking-widest mt-1">Status de pagamentos e ações via WhatsApp/Email</p>
      </div>
      <div class="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/5 shadow-inner">
          <button class="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg btn-primary">Todos</button>
          <button class="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg text-white/40 hover:text-white/80 transition-all">Pendentes</button>
          <button class="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg text-white/40 hover:text-white/80 transition-all">Atrasados</button>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-separate border-spacing-y-2.5">
        <thead>
          <tr class="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
            <th class="px-4 py-3">Empresa / Parceiro</th>
            <th class="px-4 py-3">Vencimento</th>
            <th class="px-4 py-3">Valor</th>
            <th class="px-4 py-3">Status</th>
            <th class="px-4 py-3 text-right">Cobrar</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in payments" :key="payment.id" 
              class="group/row bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-2xl border border-transparent hover:border-kros-blue/10">
            <td class="px-4 py-5 first:rounded-l-2xl">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-kros-blue/10 flex items-center justify-center text-kros-blue font-bold text-[10px] border border-kros-blue/10">
                  {{ payment.company_name?.charAt(0) }}
                </div>
                <div>
                   <p class="font-bold text-xs text-white uppercase tracking-tight">{{ payment.company_name }}</p>
                   <p class="text-[9px] text-white/40 font-bold uppercase tracking-tighter">{{ payment.plan_name }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-5">
               <span class="text-xs font-bold tabular-nums text-white/60">{{ formatDate(payment.due_date) }}</span>
            </td>
            <td class="px-4 py-5">
               <span class="text-xs font-black tabular-nums text-white/90">{{ formatCurrency(payment.amount) }}</span>
            </td>
            <td class="px-4 py-5">
               <div class="flex items-center gap-2">
                  <span :class="['w-1.5 h-1.5 rounded-full ring-4', getStatusColor(payment.status)]"></span>
                  <span :class="['text-[9px] font-black uppercase tracking-widest', getStatusTextColor(payment.status)]">
                    {{ payment.status }}
                  </span>
               </div>
            </td>
            <td class="px-4 py-5 last:rounded-r-2xl text-right">
               <div class="flex items-center justify-end gap-2 pr-1">
                  <button 
                    @click="openMsgModal(payment)"
                    title="Cobrar via Sistema/API"
                    class="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all group/wa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-14h.8A8.38 8.38 0 0 1 21 11.5Z"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M8 12h.01"/></svg>
                  </button>
                  <button 
                    class="p-2.5 rounded-xl bg-white/5 text-white/40 hover:btn-primary transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </button>
               </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="payments.length === 0" class="flex flex-col items-center justify-center py-20 opacity-40">
       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
       <p class="font-bold uppercase tracking-widest text-[10px]">Nenhum pagamento registrado</p>
    </div>

    <!-- Modal de Envio via API HTTP -->
    <BlocksKFinanceSendMsgModal 
      v-if="isMsgModalOpen"
      :is-open="isMsgModalOpen"
      :payment="selectedPayment"
      @close="isMsgModalOpen = false"
      @sent="handleMessageSent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  payments: any[]
}>()

const isMsgModalOpen = ref(false)
const selectedPayment = ref<any>(null)

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(date))
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pago': return 'bg-emerald-500 ring-emerald-500/10'
    case 'pendente': return 'bg-amber-500 ring-amber-500/10'
    case 'atrasado': return 'bg-red-500 ring-red-500/10'
    default: return 'bg-slate-500 ring-slate-500/10'
  }
}

const getStatusTextColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'pago': return 'text-emerald-500'
    case 'pendente': return 'text-amber-500'
    case 'atrasado': return 'text-red-500'
    default: return 'text-white/40'
  }
}

const openMsgModal = (payment: any) => {
  if (!payment.company_whatsapp) {
    alert('Empresa sem WhatsApp cadastrado. Não será possível enviar mensagem.')
    return
  }
  selectedPayment.value = payment
  isMsgModalOpen.value = true
}

const handleMessageSent = () => {
  isMsgModalOpen.value = false
  alert('Mensagem enviada com sucesso!')
}
</script>
