<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-7xl mx-auto space-y-8">
      <BlocksKTagsHeader @create="openModal()" />
      
      <BlocksKTagsGrid 
        :tags="tags" 
        :loading="loading" 
        @edit="openModal" 
        @delete="handleDelete" 
      />

      <BlocksKGlobalFooter />
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
