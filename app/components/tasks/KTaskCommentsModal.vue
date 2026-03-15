<template>
  <UiKModal :is-open="isOpen" size="lg" @close="$emit('close')">
    <UiKModalHeader :title="`Comentários - ${task?.title}`" />

    <div class="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
      <!-- Novo Comentário -->
      <div class="space-y-2">
        <label class="block text-xs font-bold uppercase tracking-widest text-white/50">Adicionar Comentário</label>
        <textarea
          v-model="newComment"
          placeholder="Escreva seu comentário..."
          rows="3"
          class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:border-kros-blue focus:outline-none transition-all resize-none"
        ></textarea>
        <button
          @click="addComment"
          :disabled="!newComment.trim() || loading"
          class="w-full px-4 py-2.5 bg-kros-blue hover:bg-kros-blue/80 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold uppercase tracking-widest text-sm transition-all"
        >
          {{ loading ? 'Adicionando...' : 'Adicionar Comentário' }}
        </button>
      </div>

      <!-- Comentários -->
      <div class="space-y-3">
        <h3 class="text-xs font-bold uppercase tracking-widest text-white/50">{{ comments.length }} Comentário(s)</h3>
        
        <div v-if="comments.length === 0" class="text-center py-8 text-white/30 text-sm">
          Nenhum comentário ainda
        </div>

        <div
          v-for="comment in comments"
          :key="comment.id"
          class="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-xs font-bold text-white/70">{{ comment.created_by || 'Anônimo' }}</p>
              <p class="text-[10px] text-white/50">{{ formatDate(comment.created_at) }}</p>
            </div>
            <button
              @click="deleteComment(comment.id!)"
              class="text-white/50 hover:text-red-400 transition-colors"
              title="Deletar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 4 21 4 23 6 23 20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6"></polyline><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
          </div>
          <p class="text-sm text-white/80">{{ comment.content }}</p>
        </div>
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
import type { TaskComment } from '~/composables/useTaskComments'
import { useTaskComments } from '~/composables/useTaskComments'

const props = defineProps<{
  isOpen: boolean
  task?: any
}>()

defineEmits(['close'])

const { comments, loading, fetchComments, addComment: addCommentApi, deleteComment: deleteCommentApi } = useTaskComments()
const newComment = ref('')
const { $notifications } = useNuxtApp()
const { success, error } = $notifications

const addComment = async () => {
  if (!newComment.value.trim() || !props.task?.id) return

  const res = await addCommentApi(props.task.id, newComment.value)
  if (res.success) {
    newComment.value = ''
    success('Comentário adicionado com sucesso!')
  } else {
    error('Erro ao adicionar comentário: ' + res.error)
  }
}

const deleteComment = async (commentId: string | undefined) => {
  if (!commentId) return
  const confirmed = confirm('Deseja deletar este comentário?')
  if (!confirmed) return

  const res = await deleteCommentApi(commentId, props.task?.id || '')
  if (res.success) {
    success('Comentário deletado com sucesso!')
  } else {
    error('Erro ao deletar comentário: ' + res.error)
  }
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

onMounted(async () => {
  if (props.task?.id) {
    await fetchComments(props.task.id)
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
