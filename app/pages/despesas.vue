<template>
  <LayoutsKPageLayout>
    <UiKLoader 
      v-if="loading" 
      message="Carregando Despesas..." 
    />

    <div v-else class="space-y-8 animate-in fade-in duration-700">
      <BlocksKExpensesManagement />
      <BlocksKGlobalFooter />
    </div>
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const loading = ref(false)

onMounted(async () => {
  loading.value = false
})
</script>
