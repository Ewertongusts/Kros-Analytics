<template>
  <div class="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden">

    <div class="relative z-10 w-full max-w-lg px-12">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-medium text-white mb-4">O controle completo<br/>da sua receita</h2>
        <p class="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
          Acompanhe métricas, automatize cobranças e recupere receita em tempo real com nossa inteligência financeira.
        </p>
      </div>
      
      <!-- Mockup do Dashboard Flutuante usando KStatCard -->
      <div class="relative w-full max-w-md mx-auto space-y-4 hover-group">
        <!-- Main Highlight Card -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,123,255,0.15)] relative z-20">
          <div class="flex items-center justify-between mb-8">
            <div>
              <p class="text-sm font-medium text-gray-400 mb-1">Receita Mensal (MRR)</p>
              <h3 class="text-4xl font-bold text-white tracking-tight">R$ 142.500<span class="text-xl text-gray-500 font-normal">,00</span></h3>
            </div>
            <div class="w-12 h-12 rounded-full bg-kros-blue/20 flex items-center justify-center border border-kros-blue/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-kros-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          
          <div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div class="h-full bg-kros-blue w-[78%] rounded-full relative">
              <div class="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/30"></div>
            </div>
          </div>
          <div class="flex justify-between mt-2 text-xs text-gray-500 font-medium">
            <span>Meta de R$ 180k</span>
            <span class="text-kros-blue">78% concluído</span>
          </div>
        </div>

        <!-- Secondary Floating Cards Grid (Reto e alinhado) -->
        <div class="grid grid-cols-2 gap-4 relative z-10 w-full">
          <UiKStatCard
            title="Inadimplência"
            value="1.2%"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </template>
          </UiKStatCard>

          <UiKStatCard
            title="Sessões Ativas"
            value="1,284"
            trend="+24%"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </template>
          </UiKStatCard>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Renderiza a prova social/mockup financeiro.
// Usa os componentes UiKStatCard na grid interativa.
</script>
