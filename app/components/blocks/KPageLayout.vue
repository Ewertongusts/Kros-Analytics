<template>
  <div class="min-h-screen bg-black">
    <div class="pt-6 px-6 max-w-7xl mx-auto">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Layout padrão para todas as páginas
</script>

<style scoped>
/* Espaçamento padrão entre seções */
:deep(.space-y-4) {
  @apply space-y-4;
}
</style>
