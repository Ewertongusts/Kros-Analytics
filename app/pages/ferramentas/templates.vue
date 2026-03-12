<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <BlocksKPageHeader title="Templates de Mensagem" subtitle="Gestão de Modelos Automatizados" />
      
      <BlocksKFinanceMessageTemplates />
      
      <BlocksKGlobalFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
