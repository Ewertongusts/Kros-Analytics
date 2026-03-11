<template>
  <div class="p-6 rounded-3xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group transition-all">
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 lg:justify-end">
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
        <!-- Filtro por Período -->
        <div class="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
          <div class="flex items-center gap-2">
            <label class="text-[9px] font-bold text-white/20 uppercase tracking-widest">Início:</label>
            <input 
              v-model="startDate"
              type="date"
              class="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
          <div class="w-px h-4 bg-white/10"></div>
          <div class="flex items-center gap-2">
            <label class="text-[9px] font-bold text-white/20 uppercase tracking-widest">Fim:</label>
            <input 
              v-model="endDate"
              type="date"
              class="bg-transparent text-white text-[10px] font-bold uppercase outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>
        </div>

        <div class="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 uppercase tracking-[0.2em]">
          Período: {{ formatCurrency(totalReceived) }}
        </div>

        <!-- Botões Globais Integrados -->
        <div class="flex items-center gap-2 ml-2 pl-4 border-l border-white/5">
            <button 
              @click="$emit('config')"
              class="p-2.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
              title="Gerenciar Empresas"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </button>
            <button 
              @click="$emit('sync')"
              class="p-2.5 bg-white/5 hover:bg-white/10 text-white/30 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
              title="Sincronizar Dados"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
            </button>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto no-scrollbar">
      <table class="w-full min-w-[900px] text-left border-separate border-spacing-y-3">
        <thead>
          <tr class="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
            <th class="px-4 py-3">Empresa</th>
            <th class="px-4 py-3">Data Pagamento</th>
            <th class="px-4 py-3">Vencimento Original</th>
            <th class="px-4 py-3">Valor Pago</th>
            <th class="px-4 py-3">Plano</th>
            <th class="px-4 py-3 text-right">Observações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in filteredHistory" :key="payment.id" 
              class="group/row bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-2xl border border-transparent">
            <td class="px-4 py-5 first:rounded-l-2xl">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-[10px] border border-emerald-500/10">
                  {{ payment.companies?.name?.charAt(0) || 'E' }}
                </div>
                <span class="font-semibold text-sm text-white uppercase tracking-tight">{{ payment.companies?.name }}</span>
              </div>
            </td>
            <td class="px-4 py-5 font-medium">
              <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest">{{ formatDate(payment.paid_at) }}</span>
            </td>
            <td class="px-4 py-5">
              <span class="text-xs font-medium text-white/40 uppercase tracking-widest">{{ formatDate(payment.due_date) }}</span>
            </td>
            <td class="px-4 py-5 font-bold tabular-nums text-white">
              {{ formatCurrency(payment.amount) }}
            </td>
            <td class="px-4 py-5">
              <span class="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-white/60 uppercase tracking-widest">{{ payment.plan_name }}</span>
            </td>
            <td class="px-4 py-5 last:rounded-r-2xl text-right">
              <span class="text-[10px] text-white/30 italic truncate max-w-[200px] block transition-all group-hover/row:text-white/60">
                {{ payment.notes || 'Sem observações' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filteredHistory.length === 0" class="flex flex-col items-center justify-center py-20 opacity-60">
       <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="mb-4 text-white/20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
       <p class="font-bold uppercase tracking-widest text-[10px] text-white/40">Nenhum registro de pagamento encontrado para este período</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  history: any[],
  activeSubTab: string
}>()

const emit = defineEmits(['update:activeSubTab', 'sync', 'config'])

// Inicializa com o mês atual
const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] || ''
const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0] || ''

const startDate = ref<string>(firstDay)
const endDate = ref<string>(lastDay)

const filteredHistory = computed(() => {
  return props.history.filter(p => {
    if (!p.paid_at) return false
    const payDate = p.paid_at.split('T')[0]
    return payDate >= startDate.value && payDate <= endDate.value
  }).sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime()) // Mais recentes primeiro
})

const totalReceived = computed(() => {
  return filteredHistory.value.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(date))
}
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
