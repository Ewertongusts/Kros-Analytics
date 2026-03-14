<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-white">Categorias</h2>
        <p class="text-white/60 text-sm mt-1">Gerencie suas categorias de despesas</p>
      </div>
      <button
        @click="showNewCategoryModal = true"
        class="px-4 py-2.5 bg-[var(--kros-blue)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity text-xs uppercase tracking-[0.1em]"
      >
        + Nova Categoria
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-white/60">Carregando categorias...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
      <p class="text-red-400">{{ error }}</p>
    </div>

    <!-- Categories Grid -->
    <div v-if="!loading && categories.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="category in categories"
        :key="category.id"
        class="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <div
                v-if="category.color"
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: category.color }"
              />
              <h3 class="text-white font-semibold text-sm">{{ category.name }}</h3>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="editCategory(category)"
              class="p-2 hover:bg-white/10 rounded transition-colors"
              title="Editar"
            >
              ✏️
            </button>
            <button
              @click="handleDeleteCategory(category.id)"
              class="p-2 hover:bg-red-500/10 rounded transition-colors"
              title="Deletar"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && categories.length === 0" class="text-center py-12">
      <p class="text-white/60">Nenhuma categoria criada ainda</p>
      <button
        @click="showNewCategoryModal = true"
        class="mt-4 px-4 py-2 bg-[var(--kros-blue)] text-white rounded-lg hover:opacity-90 transition-opacity text-xs uppercase tracking-[0.1em]"
      >
        Criar Primeira Categoria
      </button>
    </div>

    <!-- New/Edit Category Modal -->
    <Teleport to="body">
      <div v-if="showNewCategoryModal" class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
        <div @click="closeModal" class="fixed inset-0 bg-black/90 backdrop-blur-xl"></div>
        
        <div class="relative bg-[#0D0D0E] border border-white/10 rounded-[2.5rem] w-full max-w-md p-6 shadow-[0_0_100px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto custom-scrollbar">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-[13px] font-black uppercase tracking-[0.2em] text-white">
              {{ editingCategory ? 'Editar Categoria' : 'Nova Categoria' }}
            </h2>
            <button
              @click="closeModal"
              class="text-white/50 hover:text-white transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="saveCategory" class="space-y-6">
            <!-- Informações Básicas -->
            <div class="space-y-3">
              <h3 class="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--kros-blue)]">Informações Básicas</h3>
              
              <!-- Name -->
              <div class="space-y-2">
                <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Nome *</label>
                <input
                  v-model="formData.name"
                  type="text"
                  required
                  placeholder="Ex: Alimentação"
                  class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-[var(--kros-blue)] transition-all font-medium placeholder:text-white/20"
                />
              </div>

              <!-- Color -->
              <div class="space-y-2">
                <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Cor</label>
                <div class="flex gap-3">
                  <input
                    v-model="formData.color"
                    type="color"
                    class="w-16 h-10 rounded-xl cursor-pointer border border-white/10"
                  />
                  <input
                    v-model="formData.color"
                    type="text"
                    placeholder="#3B82F6"
                    class="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-[var(--kros-blue)] transition-all font-medium placeholder:text-white/20"
                  />
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white font-semibold text-xs uppercase tracking-[0.1em] hover:border-[var(--kros-blue)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="!formData.name || loading"
                class="flex-1 px-4 py-2.5 bg-[var(--kros-blue)] text-white font-semibold text-xs uppercase tracking-[0.1em] rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {{ loading ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, toRef } from 'vue'
import { useExpenses, type Category } from '~/composables/useExpenses'

const expensesComposable = useExpenses()
const { 
  loading, 
  error, 
  fetchCategories, 
  upsertCategory, 
  deleteCategory: deleteCategoryFromApi 
} = expensesComposable

// Use toRef to maintain reactivity
const categories = toRef(expensesComposable, 'categories')

const showNewCategoryModal = ref(false)
const editingCategory = ref<Category | null>(null)
const formData = ref({
  name: '',
  color: '#3B82F6',
})

// Watch for changes in categories
watch(
  () => categories.value.length,
  (newLength, oldLength) => {
    console.log('👁️ [KCategoriesManagement.watch] categories.value.length changed:', {
      from: oldLength,
      to: newLength,
      items: categories.value.map(c => ({ id: c.id, name: c.name }))
    })
  }
)

onMounted(async () => {
  console.log('🚀 [KCategoriesManagement.onMounted] Component mounted')
  console.log('🚀 [KCategoriesManagement.onMounted] Current categories.value:', {
    length: categories.value.length,
    items: categories.value.map(c => ({ id: c.id, name: c.name }))
  })
  console.log('🚀 [KCategoriesManagement.onMounted] Calling fetchCategories()...')
  await fetchCategories()
  console.log('🚀 [KCategoriesManagement.onMounted] After fetchCategories, categories.value:', {
    length: categories.value.length,
    items: categories.value.map(c => ({ id: c.id, name: c.name }))
  })
})

const editCategory = (category: Category) => {
  console.log('📝 [KCategoriesManagement.editCategory] Editing category:', { id: category.id, name: category.name })
  editingCategory.value = category
  formData.value = {
    name: category.name,
    color: category.color || '#3B82F6',
  }
  showNewCategoryModal.value = true
}

const saveCategory = async () => {
  console.log('💾 [KCategoriesManagement.saveCategory] ===== START =====')
  console.log('💾 [KCategoriesManagement.saveCategory] Form data:', formData.value)
  console.log('💾 [KCategoriesManagement.saveCategory] Editing category:', editingCategory.value?.id)
  
  if (!formData.value.name) {
    console.log('💾 [KCategoriesManagement.saveCategory] Name is empty, returning')
    return
  }

  console.log('💾 [KCategoriesManagement.saveCategory] Calling upsertCategory with:', {
    id: editingCategory.value?.id,
    name: formData.value.name,
    color: formData.value.color,
  })

  const result = await upsertCategory({
    id: editingCategory.value?.id,
    name: formData.value.name,
    color: formData.value.color,
  })

  console.log('💾 [KCategoriesManagement.saveCategory] upsertCategory result:', result)
  console.log('💾 [KCategoriesManagement.saveCategory] Current categories.value:', {
    length: categories.value.length,
    items: categories.value.map(c => ({ id: c.id, name: c.name }))
  })

  if (result.success) {
    console.log('💾 [KCategoriesManagement.saveCategory] Success, closing modal')
    closeModal()
  } else {
    console.log('💾 [KCategoriesManagement.saveCategory] Failed:', result.error)
  }
  console.log('💾 [KCategoriesManagement.saveCategory] ===== END =====')
}

const handleDeleteCategory = async (id: string) => {
  console.log('🗑️ [KCategoriesManagement.handleDeleteCategory] Deleting category:', id)
  if (confirm('Tem certeza que deseja deletar esta categoria?')) {
    console.log('🗑️ [KCategoriesManagement.handleDeleteCategory] User confirmed, calling deleteCategoryFromApi')
    await deleteCategoryFromApi(id)
    console.log('🗑️ [KCategoriesManagement.handleDeleteCategory] After delete, categories.value:', {
      length: categories.value.length,
      items: categories.value.map(c => ({ id: c.id, name: c.name }))
    })
  }
}

const closeModal = () => {
  console.log('❌ [KCategoriesManagement.closeModal] Closing modal')
  showNewCategoryModal.value = false
  editingCategory.value = null
  formData.value = {
    name: '',
    color: '#3B82F6',
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 123, 255, 0.2);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 123, 255, 0.4);
}
</style>
