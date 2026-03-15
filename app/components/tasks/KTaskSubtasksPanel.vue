<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-bold text-white uppercase tracking-widest">Subtarefas</h3>
      <button
        @click="showAddSubtask = !showAddSubtask"
        class="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-all text-xs font-bold"
        title="Adicionar subtarefa"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>

    <!-- Completion Progress -->
    <div v-if="subtasks.length > 0" class="space-y-2">
      <div class="flex items-center justify-between text-xs">
        <span class="text-white/70">Progresso</span>
        <span class="text-white font-bold">{{ completionPercentage }}%</span>
      </div>
      <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
          :style="{ width: `${completionPercentage}%` }"
        />
      </div>
    </div>

    <!-- Add Subtask Form -->
    <div v-if="showAddSubtask" class="p-3 bg-white/5 rounded-lg border border-white/10 space-y-2">
      <input
        v-model="newSubtaskTitle"
        type="text"
        placeholder="Título da subtarefa..."
        class="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-blue-500/50"
        @keydown.enter="addSubtask"
      />
      <div class="flex gap-2">
        <button
          @click="addSubtask"
          :disabled="!newSubtaskTitle.trim() || submitting"
          class="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all"
        >
          {{ submitting ? 'Adicionando...' : 'Adicionar' }}
        </button>
        <button
          @click="showAddSubtask = false"
          class="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all"
        >
          Cancelar
        </button>
      </div>
    </div>

    <!-- Subtasks List -->
    <div v-if="subtasks.length > 0" class="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
      <div
        v-for="subtask in subtasks"
        :key="subtask.id"
        class="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all group"
      >
        <div class="flex items-start gap-3">
          <input
            type="checkbox"
            :checked="subtask.status === 'done'"
            @change="toggleSubtaskStatus(subtask)"
            class="mt-1 w-4 h-4 rounded cursor-pointer accent-blue-500"
          />
          <div class="flex-1 min-w-0">
            <p 
              :class="[
                'text-sm font-medium break-words',
                subtask.status === 'done' 
                  ? 'text-white/40 line-through' 
                  : 'text-white'
              ]"
            >
              {{ subtask.title }}
            </p>
            <div v-if="subtask.priority" class="flex items-center gap-2 mt-1">
              <span 
                :class="[
                  'text-[10px] font-bold px-2 py-0.5 rounded',
                  subtask.priority === 'alta' ? 'bg-red-500/20 text-red-400' :
                  subtask.priority === 'media' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                ]"
              >
                {{ subtask.priority }}
              </span>
            </div>
          </div>
          <button
            @click="deleteSubtask(subtask.id!)"
            class="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
            title="Deletar subtarefa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!showAddSubtask" class="text-center py-6 text-white/30 text-xs">
      Nenhuma subtarefa. Clique em + para adicionar.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Subtask } from '~/composables/useSubtasks'

interface Props {
  taskId: string
  submitting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  submitting: false
})

const emit = defineEmits<{
  'subtask:add': [title: string]
  'subtask:update': [subtask: Subtask]
  'subtask:delete': [subtaskId: string]
}>()

const { fetchSubtasks, createSubtask, updateSubtask, deleteSubtask: deleteSubtaskApi, getCompletionPercentage } = useSubtasks()

const subtasks = ref<Subtask[]>([])
const showAddSubtask = ref(false)
const newSubtaskTitle = ref('')
const loading = ref(false)
const completionPercentage = ref(0)

const loadSubtasks = async () => {
  loading.value = true
  subtasks.value = await fetchSubtasks(props.taskId)
  completionPercentage.value = await getCompletionPercentage(props.taskId)
  loading.value = false
}

const addSubtask = async () => {
  if (!newSubtaskTitle.value.trim()) return

  const result = await createSubtask(props.taskId, {
    title: newSubtaskTitle.value,
    priority: 'media'
  })

  if (result) {
    subtasks.value.push(result)
    newSubtaskTitle.value = ''
    showAddSubtask.value = false
    completionPercentage.value = await getCompletionPercentage(props.taskId)
    emit('subtask:add', result.title!)
  }
}

const toggleSubtaskStatus = async (subtask: Subtask) => {
  const newStatus = subtask.status === 'done' ? 'todo' : 'done'
  const result = await updateSubtask(subtask.id!, { status: newStatus })

  if (result) {
    const index = subtasks.value.findIndex(st => st.id === subtask.id)
    if (index !== -1 && subtasks.value[index]) {
      subtasks.value[index]!.status = newStatus
    }
    completionPercentage.value = await getCompletionPercentage(props.taskId)
    emit('subtask:update', result)
  }
}

const deleteSubtask = async (subtaskId: string) => {
  if (!confirm('Tem certeza que deseja deletar esta subtarefa?')) return

  const success = await deleteSubtaskApi(subtaskId)
  if (success) {
    subtasks.value = subtasks.value.filter(st => st.id !== subtaskId)
    completionPercentage.value = await getCompletionPercentage(props.taskId)
    emit('subtask:delete', subtaskId)
  }
}

watch(() => props.taskId, () => {
  loadSubtasks()
}, { immediate: true })
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
