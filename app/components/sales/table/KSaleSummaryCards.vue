<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <!-- Produtos -->
    <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <span class="text-xl">📦</span>
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
          <span class="text-xl">🛠️</span>
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
          <span class="text-xl">✨</span>
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
          <span class="text-xl">💰</span>
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
