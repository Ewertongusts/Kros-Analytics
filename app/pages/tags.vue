<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <UiKLoader 
        v-if="loading && tags.length === 0" 
        message="Indexando Tags e Segmentos..." 
      />
      
      <div v-else class="space-y-8">
        <BlocksKPageHeader title="Tags e Segmentos" subtitle="Organização e Categorização de Clientes">
          <template #actions>
            <button 
              @click="openModal()"
              class="px-6 py-3 bg-kros-blue hover:bg-kros-blue/80 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7v14"/></svg>
              Nova Tag
            </button>
          </template>
        </BlocksKPageHeader>
        
        <BlocksKTagsGrid 
          :tags="tags" 
          :loading="loading" 
          @edit="openModal" 
          @delete="handleDelete" 
        />

        <BlocksKGlobalFooter />
      </div>
    </div>

    <BlocksKTagModal 
      :is-open="isModalOpen" 
      :initial-data="selectedTag" 
      :submitting="loading"
      @close="closeModal" 
      @save="handleSave" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTags, type TagDefinition } from '~/composables/useTags'

definePageMeta({
  middleware: 'auth'
})

const { tags, loading, fetchTags, upsertTag, deleteTag } = useTags()

const isModalOpen = ref(false)
const selectedTag = ref<TagDefinition | undefined>(undefined)

const openModal = (tag?: TagDefinition) => {
  selectedTag.value = tag
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  selectedTag.value = undefined
}

const handleSave = async (form: TagDefinition) => {
  const res = await upsertTag(form)
  if (res.success) {
    closeModal()
  } else {
    alert('Erro ao salvar tag: ' + res.error)
  }
}

const handleDelete = async (id: string) => {
  if (confirm('Deseja realmente excluir esta tag?')) {
    await deleteTag(id)
  }
}

onMounted(() => {
  fetchTags()
})
</script>
