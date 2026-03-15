<template>
  <UiKModal :is-open="isOpen" size="lg" @close="$emit('close')">
    <UiKModalHeader title="📎 Anexos da Tarefa" />

    <div class="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
      <!-- Upload Area -->
      <div
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="handleDrop"
        :class="[
          'p-6 border-2 border-dashed rounded-xl transition-all cursor-pointer',
          isDragging
            ? 'border-kros-blue bg-kros-blue/10'
            : 'border-white/20 bg-white/5 hover:border-white/40'
        ]"
      >
        <label class="cursor-pointer">
          <input
            ref="fileInput"
            type="file"
            multiple
            @change="handleFileSelect"
            class="hidden"
          />
          <div class="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2 text-kros-blue"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p class="text-sm font-bold text-white mb-1">Arraste arquivos aqui ou clique para selecionar</p>
            <p class="text-xs text-white/50">Máximo 10MB por arquivo</p>
          </div>
        </label>
      </div>

      <!-- Upload Progress -->
      <div v-if="uploading" class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin text-blue-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span class="text-sm text-blue-300">Enviando arquivo...</span>
        </div>
      </div>

      <!-- Attachments List -->
      <div v-if="attachments.length > 0" class="space-y-2">
        <p class="text-xs font-bold text-white/50 uppercase tracking-widest">Anexos ({{ attachments.length }})</p>
        <div
          v-for="attachment in attachments"
          :key="attachment.id"
          class="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between hover:bg-white/10 transition-all"
        >
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <span class="text-xl flex-shrink-0">{{ getFileIcon(attachment.file_type) }}</span>
            <div class="flex-1 min-w-0">
              <a
                :href="attachment.file_url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm font-semibold text-kros-blue hover:text-kros-blue/80 truncate block"
              >
                {{ attachment.file_name }}
              </a>
              <p class="text-xs text-white/50">{{ formatFileSize(attachment.file_size) }} • {{ formatDate(attachment.created_at) }}</p>
            </div>
          </div>
          <button
            @click="handleDelete(attachment.id, attachment.file_url)"
            class="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all flex-shrink-0"
            title="Deletar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>

      <div v-else class="text-center py-8 text-white/30">
        <p class="text-sm">Nenhum anexo ainda</p>
      </div>
    </div>

    <UiKModalActions
      cancel-text="Fechar"
      :show-confirm="false"
      @cancel="$emit('close')"
    />
  </UiKModal>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTaskAttachments } from '~/composables/useTaskAttachments'

const props = defineProps<{
  isOpen: boolean
  taskId: string
}>()

const emit = defineEmits(['close'])

const fileInput = ref<HTMLInputElement>()
const isDragging = ref(false)

const { attachments, uploading, fetchAttachments, uploadAttachment, deleteAttachment, getFileIcon, formatFileSize } = useTaskAttachments()

const handleFileSelect = async (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files) {
    await uploadFiles(Array.from(files))
  }
}

const handleDrop = async (e: DragEvent) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files) {
    await uploadFiles(Array.from(files))
  }
}

const uploadFiles = async (files: File[]) => {
  const user = useSupabaseUser()
  if (!user.value) return

  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      alert(`Arquivo ${file.name} é muito grande (máximo 10MB)`)
      continue
    }
    await uploadAttachment(props.taskId, file, user.value.email || 'unknown')
  }
}

const handleDelete = async (attachmentId: string, fileUrl: string) => {
  const confirmed = confirm('Deseja deletar este anexo?')
  if (!confirmed) return

  const filePath = fileUrl.split('/').slice(-2).join('/')
  await deleteAttachment(attachmentId, filePath)
}

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

onMounted(() => {
  if (props.taskId) {
    fetchAttachments(props.taskId)
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
