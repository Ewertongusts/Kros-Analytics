<template>
  <LayoutsKPageLayout>
    <KFinanceMessageTemplates />
    
    <BlocksKGlobalFooter />
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
// Página de Modelos de Mensagem
definePageMeta({
  middleware: 'auth'
})
</script>
