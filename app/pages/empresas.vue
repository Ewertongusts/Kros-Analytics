<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-12">
      <UiKLoader 
        v-if="loading && companies.length === 0" 
        message="Sincronizando Entidades..." 
      />
      
      <div v-else class="space-y-12 animate-in slide-in-from-bottom duration-700">
        <BlocksKCompaniesHeader @add-company="openAddModal" />

        <BlocksKCompaniesTable 
          :companies="companies" 
          @edit="openEditModal" 
          @delete="handleDelete" 
        />

        <BlocksKGlobalFooter />
      </div>
    </div>

    <!-- Modal de Cadastro/Edição -->
    <BlocksKCompanyModal 
      :is-open="isModalOpen" 
      :company="selectedCompany"
      :loading="loading"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const { companies, loading, fetchCompanies, upsertCompany, deleteCompany } = useCompanies()

const isModalOpen = ref(false)
const selectedCompany = ref<any>(null)

const openAddModal = () => {
  selectedCompany.value = null
  isModalOpen.value = true
}

const openEditModal = (company: any) => {
  selectedCompany.value = { ...company }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedCompany.value = null
}

const handleSave = async (formData: any) => {
  const result = await upsertCompany(formData)
  if (result.success) {
    closeModal()
  } else {
    alert('Erro ao salvar empresa: ' + result.error)
  }
}

const handleDelete = async (id: string) => {
  if (confirm('Tem certeza que deseja excluir esta empresa? Todos os dados vinculados serão perdidos.')) {
    const result = await deleteCompany(id)
    if (!result.success) {
      alert('Erro ao excluir empresa: ' + result.error)
    }
  }
}

onMounted(() => {
  fetchCompanies()
})
</script>
