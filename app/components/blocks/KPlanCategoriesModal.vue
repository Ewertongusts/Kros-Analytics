<template>
  <UiKModal :is-open="isOpen" size="md" @close="$emit('close')">
    <UiKModalHeader title="CATEGORIAS DO CATÁLOGO" />

        <div class="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
          <div v-for="category in categories" :key="category.id" class="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10 rounded-xl hover:border-kros-blue/30 transition-all">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ category.icon }}</span>
              <div>
                <p class="text-sm font-bold text-white">{{ category.name }}</p>
              </div>
            </div>
            <button 
              @click="deleteCategory(category.id)"
              class="p-2 rounded-lg hover:bg-red-500/10 text-red-500/50 hover:text-red-500 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </button>
          </div>

          <div v-if="categories.length === 0" class="text-center py-8 text-white/40 text-xs">
            Nenhuma categoria cadastrada
          </div>
        </div>

        <form @submit.prevent="addCategory" class="mt-4 pt-4 border-t border-white/10">
          <p v-if="errorMessage" class="text-red-400 text-xs mb-2 text-center">{{ errorMessage }}</p>
          <div class="flex gap-2">
            <input 
              v-model="newCategoryName"
              type="text"
              placeholder="Nome da categoria..."
              class="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20"
            />
            <input 
              v-model="newCategoryIcon"
              type="text"
              placeholder="🏷️"
              maxlength="2"
              class="w-16 bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-center text-white outline-none focus:border-kros-blue transition-all"
            />
            <button 
              type="submit"
              class="px-4 py-2.5 bg-kros-blue hover:bg-kros-blue/80 text-white rounded-xl text-xs font-bold transition-all"
            >
              +
            </button>
          </div>
        </form>

    <div class="mt-4 pt-4 border-t border-white/10">
      <button 
        @click="$emit('close')"
        class="w-full py-2.5 text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
      >
        Fechar
      </button>
    </div>
  </UiKModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { confirm } = useToast()

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close'])

const supabase = useSupabaseClient()
const categories = ref<any[]>([])
const newCategoryName = ref('')
const newCategoryIcon = ref('🏷️')
const errorMessage = ref('')

const fetchCategories = async () => {
  const { data } = await supabase
    .from('plan_categories')
    .select('*')
    .order('name')
  
  categories.value = data || []
}

const addCategory = async () => {
  if (!newCategoryName.value.trim()) return
  
  errorMessage.value = ''
  
  const { error } = await (supabase as any)
    .from('plan_categories')
    .insert([{
      name: newCategoryName.value.trim(),
      icon: newCategoryIcon.value || '🏷️'
    }])
  
  if (error) {
    if (error.code === '23505') {
      errorMessage.value = 'Categoria já existe!'
    } else {
      errorMessage.value = 'Erro ao adicionar categoria'
    }
    setTimeout(() => errorMessage.value = '', 3000)
    return
  }
  
  newCategoryName.value = ''
  newCategoryIcon.value = '🏷️'
  await fetchCategories()
}

const deleteCategory = async (id: string) => {
  const confirmed = await confirm('Deseja remover esta categoria?', 'Remover categoria')
  if (!confirmed) return
  
  await supabase
    .from('plan_categories')
    .delete()
    .eq('id', id)
  
  await fetchCategories()
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 123, 255, 0.1);
  border-radius: 10px;
}
</style>
