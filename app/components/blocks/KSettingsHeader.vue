<template>
  <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
    <div class="space-y-2">
      <div class="flex items-center gap-2 text-[10px] font-bold text-kros-blue uppercase tracking-[0.3em]">
        <span>Configurações</span>
        <span class="text-white/20">/</span>
        <span class="text-white/60">{{ activeTabName }}</span>
      </div>
      <h1 class="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
        Ajustes do <span class="text-kros-blue">Sistema</span>
      </h1>
      <p class="text-xs text-white/40 tracking-widest font-medium uppercase">Gerencie seu perfil, segurança e preferências</p>
    </div>
    
    <div class="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
      <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
      <span class="text-[10px] font-bold uppercase tracking-widest text-white/60">Sistema Online</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activeTabName: string
}>()
</script>
