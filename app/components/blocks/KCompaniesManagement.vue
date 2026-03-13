<template>
  <div class="space-y-8 animate-in slide-in-from-bottom duration-700">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xl font-bold text-white tracking-tight uppercase">Base de Clientes</h3>
        <p class="text-xs text-white/40 font-medium uppercase tracking-widest mt-1">Gerenciamento de parceiros e faturamento ativo</p>
      </div>
      <button 
        @click="openAddModal"
        class="px-6 py-3 bg-kros-blue hover:bg-kros-blue/80 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        Novo Cliente
      </button>
    </div>

    <ClientsKClientsTable 
      :companies="companies" 
      @edit="openEditModal" 
      @delete="handleDelete" 
    />

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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useCompanies } from '~/composables/useCompanies'
import { useToast } from '~/composables/useToast'

const { companies, loading, fetchCompanies, upsertCompany, deleteCompany } = useCompanies()
const { confirm } = useToast()

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
    // Recarregar imediatamente após salvar
    await fetchCompanies()
  } else {
    alert('Erro ao salvar empresa: ' + result.error)
  }
}

const handleDelete = async (id: string) => {
  const confirmed = await confirm('Tem certeza que deseja excluir esta empresa? Todos os dados vinculados serão perdidos.', 'Excluir empresa')
  if (confirmed) {
    const result = await deleteCompany(id)
    if (!result.success) {
      alert('Erro ao excluir empresa: ' + result.error)
    } else {
      // Recarregar imediatamente após deletar
      await fetchCompanies()
    }
  }
}

onMounted(() => {
  console.log('📱 [KCompaniesManagement] Componente montado')
  console.log('📱 [KCompaniesManagement] Chamando fetchCompanies...')
  fetchCompanies()
  
  // Log periódico para monitorar se os dados desaparecem
  const interval = setInterval(() => {
    console.log('📊 [KCompaniesManagement] Status atual - companies.length:', companies.value?.length || 0)
    if (companies.value && companies.value.length > 0) {
      console.log('  Primeiro:', companies.value[0]?.name)
    }
  }, 5000)
  
  onBeforeUnmount(() => clearInterval(interval))
})
</script>
