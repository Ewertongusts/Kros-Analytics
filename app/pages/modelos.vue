<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <KFinanceMessageTemplates />
      
      <BlocksKGlobalFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
// Página de Modelos de Mensagem
definePageMeta({
  middleware: 'auth'
})
</script>
