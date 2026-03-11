<template>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
    <div class="p-4 rounded-xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/30 transition-all">
      <p class="text-[10px] uppercase font-bold text-kros-text/60 dark:text-white/60 mb-1 tracking-widest">Total Clientes</p>
      <p class="text-xl font-semibold text-kros-text dark:text-kros-surface">{{ stats.totalClients }}</p>
    </div>
    <div class="p-4 rounded-xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/30 transition-all">
      <p class="text-[10px] uppercase font-bold text-kros-text/60 dark:text-white/60 mb-1 tracking-widest">Usuários Ativos</p>
      <p class="text-xl font-semibold text-kros-text dark:text-kros-surface">{{ stats.activeUsers }}</p>
    </div>
    <div class="p-4 rounded-xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/30 transition-all">
      <p class="text-[10px] uppercase font-bold text-kros-text/60 dark:text-white/60 mb-1 tracking-widest">Empresas (Ativ/Inat)</p>
      <div class="flex items-end gap-2 text-xl font-semibold">
        <span class="text-emerald-500">{{ stats.activeCompanies }}</span>
        <span class="text-white/40">/</span>
        <span class="text-red-500/60">{{ stats.inactiveCompanies }}</span>
      </div>
    </div>
    <div class="p-4 rounded-xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/30 transition-all border-l-2 border-l-emerald-500/20">
      <p class="text-[10px] uppercase font-bold text-emerald-500/40 mb-1 tracking-widest">Notificações Auto</p>
      <p class="text-xl font-semibold text-emerald-500">{{ autoNotifiedCount }}</p>
    </div>
    <div class="p-4 rounded-xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/30 transition-all">
      <p class="text-[10px] uppercase font-bold text-kros-text/60 dark:text-white/60 mb-1 tracking-widest">Mensalidades (Paga/Pend)</p>
      <div class="flex items-end gap-2 text-xl font-semibold">
        <span class="text-emerald-500">{{ stats.paidPaymentsCount }}</span>
        <span class="text-white/40">/</span>
        <span class="text-amber-500">{{ stats.pendingPaymentsCount }}</span>
      </div>
    </div>
    <div class="p-4 rounded-xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/30 transition-all">
      <p class="text-[10px] uppercase font-bold text-kros-text/60 dark:text-white/60 mb-1 tracking-widest">A Receber</p>
      <p class="text-xl font-semibold text-amber-500">{{ formatCurrency(stats.pendingAmount) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  stats: any
}>()

const autoNotifiedCount = computed(() => {
  if (!props.stats.paymentsList) return 0
  return props.stats.paymentsList.filter((p: any) => p.cron_message && p.cron_message.trim() !== '').length
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>

