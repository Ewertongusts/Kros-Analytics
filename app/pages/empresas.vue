<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-12">
      <div v-if="loading && companies.length === 0" class="flex flex-col items-center justify-center h-[70vh] gap-6 animate-pulse">
        <div class="w-16 h-16 bg-kros-blue/10 rounded-3xl flex items-center justify-center text-kros-blue">
          <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <p class="text-[11px] font-black uppercase tracking-[0.4em] opacity-30">Fetching Entities...</p>
      </div>
      
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
