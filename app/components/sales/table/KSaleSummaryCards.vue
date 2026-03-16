<template>
  <div class="space-y-6">
    <!-- Seção: Resumo Geral -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Resumo Geral</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Produtos Pagos -->
        <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-400">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Produtos Pagos</p>
              <p class="text-2xl font-black text-white">{{ summary.produtosPagos.count }}</p>
            </div>
          </div>
          <p class="text-xs font-bold text-purple-400">{{ formatCurrency(summary.produtosPagos.total) }}</p>
        </div>

        <!-- Serviços Pagos -->
        <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Serviços Pagos</p>
              <p class="text-2xl font-black text-white">{{ summary.servicosPagos.count }}</p>
            </div>
          </div>
          <p class="text-xs font-bold text-blue-400">{{ formatCurrency(summary.servicosPagos.total) }}</p>
        </div>

        <!-- Total Recebido -->
        <div class="p-6 rounded-2xl bg-white/[0.02] border border-emerald-500/20">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Recebido</p>
              <p class="text-2xl font-black text-white">{{ summary.totalPago.count }}</p>
            </div>
          </div>
          <p class="text-xs font-bold text-emerald-400">{{ formatCurrency(summary.totalPago.total) }}</p>
        </div>
      </div>
    </div>

    <!-- Seção: Pendências -->
    <div>
      <h3 class="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">Pendências</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Produtos a Receber -->
        <div class="p-6 rounded-2xl bg-white/[0.02] border border-orange-500/20">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-400">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M8 16H3v5"></path>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Produtos a Receber</p>
              <p class="text-2xl font-black text-white">{{ summary.produtosPendentes.count }}</p>
            </div>
          </div>
          <p class="text-xs font-bold text-orange-400">{{ formatCurrency(summary.produtosPendentes.total) }}</p>
        </div>

        <!-- Serviços a Receber -->
        <div class="p-6 rounded-2xl bg-white/[0.02] border border-red-500/20">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Serviços a Receber</p>
              <p class="text-2xl font-black text-white">{{ summary.servicosPendentes.count }}</p>
            </div>
          </div>
          <p class="text-xs font-bold text-red-400">{{ formatCurrency(summary.servicosPendentes.total) }}</p>
        </div>

        <!-- Total em Aberto -->
        <div class="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/20">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Total em Aberto</p>
              <p class="text-2xl font-black text-white">{{ summary.totalAReceber.count }}</p>
            </div>
          </div>
          <p class="text-xs font-bold text-amber-400">{{ formatCurrency(summary.totalAReceber.total) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  summary: {
    produtosPagos: { count: number; total: number }
    servicosPagos: { count: number; total: number }
    produtosPendentes: { count: number; total: number }
    servicosPendentes: { count: number; total: number }
    totalPago: { count: number; total: number }
    totalAReceber: { count: number; total: number }
  }
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>
