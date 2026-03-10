<template>
  <div class="min-h-screen flex text-kros-text dark:text-kros-surface bg-kros-main dark:bg-[#0A0A0B]">
    
    <!-- Lado Esquerdo: Dashboard Financeiro Interativo (Apenas Desktop) -->
    <BlocksKHeroShowcase />

    <!-- Lado Direito: Formulário -->
    <div class="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-20 xl:px-32 relative">
      
      <!-- Topo: Logo Componentizada -->
      <div class="absolute top-8 left-8 sm:left-16 md:left-24 lg:left-auto lg:right-20 xl:right-32 flex items-center gap-3">
        <UiKLogo size="md" />
      </div>

      <div class="max-w-md w-full mx-auto mt-12 sm:mt-0">
        <!-- Títulos -->
        <div class="text-center sm:text-left mb-10">
          <h1 class="text-3xl font-semibold mb-2">Bem-vindo ao {{ settings.system_name || 'Kros' }}</h1>
          <p class="text-kros-text/60 dark:text-kros-surface/60">Acesse sua inteligência financeira com segurança.</p>
        </div>

        <!-- Formulário Componentizado (Lógica inteiramente encapsulada) -->
        <BlocksKLoginForm />
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { useWhiteLabel } from '~/composables/useWhiteLabel'
const { settings } = useWhiteLabel()
</script>

