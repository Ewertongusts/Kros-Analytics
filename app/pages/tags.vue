<template>
  <LayoutsKPageLayout>
    <UiKLoader 
      v-if="loading && tags.length === 0" 
      message="Indexando Tags e Segmentos..." 
    />
    
    <div v-else class="space-y-8">
      <BlocksKPageHeader title="Tags e Segmentos" subtitle="Organização e Categorização de Clientes">
        <template #actions>
          <UiKButtonPrimary 
            icon="plus"
            @click="openModal()"
          >
            Nova Tag
          </UiKButtonPrimary>
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

    <BlocksKTagModal 
      :is-open="isModalOpen" 
      :initial-data="selectedTag" 
      :submitting="loading"
      @close="closeModal" 
      @save="handleSave" 
    />
  </LayoutsKPageLayout>
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
  const confirmed = await confirm('Deseja realmente excluir esta tag?', 'Excluir tag')
  if (confirmed) {
    await deleteTag(id)
  }
}

onMounted(() => {
  fetchTags()
})
</script>
