<template>
  <LayoutsKPageLayout
    title="Clientes"
    subtitle="Gestão de Contatos e Informações"
    :button-text="'Novo Cliente'"
    :button-icon="'plus'"
    @button-click="openAddModal"
  >
    <BlocksKCompaniesManagement 
      ref="companiesRef"
      @open-modal="openAddModal"
    />
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const companiesRef = ref()

const openAddModal = () => {
  if (companiesRef.value?.openAddModal) {
    companiesRef.value.openAddModal()
  }
}
</script>
