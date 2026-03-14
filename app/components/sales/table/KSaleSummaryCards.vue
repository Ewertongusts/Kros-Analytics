<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <!-- Produtos -->
    <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-400">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Produtos</p>
          <p class="text-2xl font-black text-white">{{ summary.produtos.count }}</p>
        </div>
      </div>
      <p class="text-xs font-bold text-purple-400">{{ formatCurrency(summary.produtos.total) }}</p>
    </div>

    <!-- Serviços -->
    <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </div>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Serviços</p>
          <p class="text-2xl font-black text-white">{{ summary.servicos.count }}</p>
        </div>
      </div>
      <p class="text-xs font-bold text-blue-400">{{ formatCurrency(summary.servicos.total) }}</p>
    </div>

    <!-- Personalizados -->
    <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-400">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"></path>
          </svg>
        </div>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Personalizados</p>
          <p class="text-2xl font-black text-white">{{ summary.personalizados.count }}</p>
        </div>
      </div>
      <p class="text-xs font-bold text-orange-400">{{ formatCurrency(summary.personalizados.total) }}</p>
    </div>

    <!-- Total Geral -->
    <div class="p-6 rounded-2xl bg-white/[0.02] border border-emerald-500/20">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Geral</p>
          <p class="text-2xl font-black text-white">{{ summary.total.count }}</p>
        </div>
      </div>
      <p class="text-xs font-bold text-emerald-400">{{ formatCurrency(summary.total.total) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  summary: {
    produtos: { count: number; total: number }
    servicos: { count: number; total: number }
    personalizados: { count: number; total: number }
    total: { count: number; total: number }
  }
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>
