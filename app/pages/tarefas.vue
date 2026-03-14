<template>
  <LayoutsKPageLayout max-width="1800px">
    <UiKLoader 
      v-if="handlerLoading" 
      message="Carregando Tarefas..." 
    />

    <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700">
      <BlocksKPageHeader title="Tarefas" subtitle="Gestão de Atividades e Progresso">
        <template #actions>
          <div class="flex items-center gap-3">
            <UiKButtonPrimary 
              icon="plus"
              @click="openTaskModal()"
            >
              Nova Tarefa
            </UiKButtonPrimary>
            <button 
              @click="syncData"
              class="p-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
              title="Sincronizar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
            </button>
          </div>
        </template>
      </BlocksKPageHeader>

      <!-- Filtros e Métricas -->
      <TasksKTasksFiltersBar 
        :tasks="handlerTasks"
        @update:search="searchQuery = $event"
        @update:priority="priorityFilter = $event"
        @update:status="statusFilter = $event"
      />

      <!-- Kanban Board -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- A Fazer -->
        <div 
          class="space-y-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 transition-all"
          :class="dragSource === 'todo' ? 'ring-2 ring-blue-500/50 bg-blue-500/10' : ''"
          @dragover="handleDragOver"
          @drop="handleTaskDrop($event, 'todo')"
        >
          <div class="flex items-center justify-between px-2">
            <h3 class="font-bold text-white uppercase tracking-widest text-sm">A Fazer</h3>
            <span class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-bold">{{ filteredTodoTasks.length }}</span>
          </div>
          <div class="space-y-3 min-h-[500px]">
            <TasksKTaskCard
              v-for="task in filteredTodoTasks"
              :key="task.id"
              :task="task"
              @edit="openTaskModal"
              @delete="(t) => deleteTask(t.id!)"
              @dragstart="handleTaskDragStart(task, 'todo')"
              @dragend="handleDragEnd"
            />
            <div v-if="filteredTodoTasks.length === 0" class="text-center py-8 text-white/30 text-sm">
              Nenhuma tarefa
            </div>
          </div>
        </div>

        <!-- Em Andamento -->
        <div 
          class="space-y-3 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 transition-all"
          :class="dragSource === 'in_progress' ? 'ring-2 ring-yellow-500/50 bg-yellow-500/10' : ''"
          @dragover="handleDragOver"
          @drop="handleTaskDrop($event, 'in_progress')"
        >
          <div class="flex items-center justify-between px-2">
            <h3 class="font-bold text-white uppercase tracking-widest text-sm">Em Andamento</h3>
            <span class="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-[10px] font-bold">{{ filteredInProgressTasks.length }}</span>
          </div>
          <div class="space-y-3 min-h-[500px]">
            <TasksKTaskCard
              v-for="task in filteredInProgressTasks"
              :key="task.id"
              :task="task"
              @edit="openTaskModal"
              @delete="(t) => deleteTask(t.id!)"
              @dragstart="handleTaskDragStart(task, 'in_progress')"
              @dragend="handleDragEnd"
            />
            <div v-if="filteredInProgressTasks.length === 0" class="text-center py-8 text-white/30 text-sm">
              Nenhuma tarefa
            </div>
          </div>
        </div>

        <!-- Concluído -->
        <div 
          class="space-y-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 transition-all"
          :class="dragSource === 'done' ? 'ring-2 ring-emerald-500/50 bg-emerald-500/10' : ''"
          @dragover="handleDragOver"
          @drop="handleTaskDrop($event, 'done')"
        >
          <div class="flex items-center justify-between px-2">
            <h3 class="font-bold text-white uppercase tracking-widest text-sm">Concluído</h3>
            <span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold">{{ filteredDoneTasks.length }}</span>
          </div>
          <div class="space-y-3 min-h-[500px] max-h-[700px] overflow-y-auto custom-scrollbar">
            <TasksKTaskCard
              v-for="task in filteredDoneTasks"
              :key="task.id"
              :task="task"
              @edit="openTaskModal"
              @delete="(t) => deleteTask(t.id!)"
              @dragstart="handleTaskDragStart(task, 'done')"
              @dragend="handleDragEnd"
            />
            <div v-if="filteredDoneTasks.length === 0" class="text-center py-8 text-white/30 text-sm">
              Nenhuma tarefa
            </div>
          </div>
        </div>
      </div>

      <BlocksKGlobalFooter />
    </div>

    <!-- Modal de Tarefa -->
      <BlocksKTaskModal 
        v-if="isTaskModalOpen"
        :is-open="isTaskModalOpen"
        :task="selectedTask"
        :companies="companies"
        :tag-definitions="tagDefinitions"
        :submitting="loadingAction"
        @close="closeTaskModal"
        @save="handleSaveTask"
      />
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'
import type { Task } from '~/composables/useTasks'
import { useTaskHandlers } from '~/composables/useTaskHandlers'
import { useTaskDragDrop } from '~/composables/useTaskDragDrop'

definePageMeta({
  middleware: 'auth'
})

const { tasks, loading, fetchTasks } = useTasks()
const { companies, fetchCompanies } = useCompanies()
const { tags: tagDefinitions, fetchTags } = useTags()

const {
  tasks: handlerTasks,
  loading: handlerLoading,
  fetchTasks: handlerFetchTasks,
  isTaskModalOpen,
  selectedTask,
  loadingAction,
  openTaskModal,
  closeTaskModal,
  handleSaveTask,
  moveTask,
  deleteTask
} = useTaskHandlers()

const { draggedTask, dragSource, handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useTaskDragDrop()

const searchQuery = ref('')
const priorityFilter = ref('')
const statusFilter = ref('')

const todoTasks = computed(() => handlerTasks.value.filter(t => t.status === 'todo'))
const inProgressTasks = computed(() => handlerTasks.value.filter(t => t.status === 'in_progress'))
const doneTasks = computed(() => handlerTasks.value.filter(t => t.status === 'done'))

// Filtros aplicados
const filteredTasks = computed(() => {
  return handlerTasks.value.filter(task => {
    const matchSearch = !searchQuery.value || 
      task.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchPriority = !priorityFilter.value || task.priority === priorityFilter.value
    const matchStatus = !statusFilter.value || task.status === statusFilter.value
    
    return matchSearch && matchPriority && matchStatus
  })
})

const filteredTodoTasks = computed(() => filteredTasks.value.filter(t => t.status === 'todo'))
const filteredInProgressTasks = computed(() => filteredTasks.value.filter(t => t.status === 'in_progress'))
const filteredDoneTasks = computed(() => filteredTasks.value.filter(t => t.status === 'done'))

const syncData = async () => {
  await handlerFetchTasks()
}

const handleTaskDragStart = (task: Task, source: string) => {
  handleDragStart(task, source)
}

const handleTaskDrop = async (e: DragEvent, targetStatus: 'todo' | 'in_progress' | 'done') => {
  await handleDrop(e, targetStatus, moveTask)
}

let unsubscribe: (() => void) | null = null

onMounted(async () => {
  await fetchCompanies()
  await fetchTags()
  await handlerFetchTasks()

  // Real-time subscription
  const supabase = useSupabaseClient()
  const channel = supabase
    .channel('tasks-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tasks' },
      () => {
        handlerFetchTasks()
      }
    )
    .subscribe()

  unsubscribe = () => {
    supabase.removeChannel(channel)
  }
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
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
