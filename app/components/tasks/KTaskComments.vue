<template>
  <div class="space-y-4">
    <div v-if="comments.length === 0" class="text-center py-8 text-white/50 text-sm">
      Nenhum comentário ainda
    </div>
    
    <div v-for="comment in comments" :key="comment.id" class="p-3 bg-white/5 rounded-lg border border-white/10">
      <div class="flex items-start justify-between mb-2">
        <div>
          <p class="text-sm font-bold text-white">{{ comment.author }}</p>
          <p class="text-xs text-white/50">{{ formatDate(comment.created_at) }}</p>
        </div>
        <button
          v-if="canDelete(comment)"
          @click="deleteComment(comment.id)"
          class="text-red-400 hover:text-red-300 text-xs"
        >
          Deletar
        </button>
      </div>
      <p class="text-sm text-white/80">{{ comment.content }}</p>
    </div>

    <div class="flex gap-2">
      <input
        v-model="newComment"
        type="text"
        placeholder="Adicionar comentário..."
        class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/20"
      />
      <button
        @click="addComment"
        :disabled="!newComment.trim()"
        class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all"
      >
        Enviar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  taskId: string
  comments: any[]
}>()

const emit = defineEmits(['add-comment', 'delete-comment'])

const newComment = ref('')

const addComment = () => {
  if (newComment.value.trim()) {
    emit('add-comment', newComment.value)
    newComment.value = ''
  }
}

const deleteComment = (id: string) => {
  emit('delete-comment', id)
}

const canDelete = (comment: any) => {
  return true
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
</script>
