<template>
  <div class="min-h-screen p-8 md:p-12">
    <div class="max-w-[1800px] mx-auto space-y-8">
      <UiKLoader 
        v-if="loading" 
        message="Carregando Tarefas..." 
      />

      <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">Gestão de Tarefas</h1>
            <p class="text-sm text-white/50">Organize suas atividades e acompanhe o progresso</p>
          </div>
          <div class="flex items-center gap-3">
            <button 
              @click="openTaskModal()"
              class="px-6 py-3 bg-kros-blue hover:bg-kros-blue/80 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Nova Tarefa
            </button>
            <button 
              @click="syncData"
              class="p-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-xl transition-all border border-transparent hover:border-white/10"
              title="Sincronizar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M22 3v5h-5"/></svg>
            </button>
          </div>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BlocksKTaskColumn 
            title="A Fazer"
            :tasks="todoTasks"
            badge-class="bg-blue-500/10 text-blue-500"
            scroll-class="min-h-[500px]"
            @edit="openTaskModal"
            @move-right="(task) => moveTask(task, 'in_progress')"
            @delete="(task) => deleteTask(task.id!)"
          />
          
          <BlocksKTaskColumn 
            title="Em Andamento"
            :tasks="inProgressTasks"
            badge-class="bg-yellow-500/10 text-yellow-500"
            scroll-class="min-h-[500px]"
            @edit="openTaskModal"
            @move-left="(task) => moveTask(task, 'todo')"
            @move-right="(task) => moveTask(task, 'done')"
            @delete="(task) => deleteTask(task.id!)"
          />
          
          <BlocksKTaskColumn 
            title="Concluído"
            :tasks="doneTasks"
            badge-class="bg-emerald-500/10 text-emerald-500"
            scroll-class="min-h-[500px] max-h-[700px] overflow-y-auto"
            @edit="openTaskModal"
            @reopen="(task) => moveTask(task, 'in_progress')"
            @delete="(task) => deleteTask(task.id!)"
          />
        </div>

        <BlocksKGlobalFooter />
      </div>

      <!-- Modal de Tarefa -->
      <BlocksKTaskModal 
        v-if="isTaskModalOpen"
        :is-open="isTaskModalOpen"
        :task="selectedTask"
        :companies="companies.value"
        :tag-definitions="tagDefinitions"
        :submitting="loadingAction"
        @close="closeTaskModal"
        @save="handleSaveTask"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Task } from '~/composables/useTasks'

definePageMeta({
  middleware: 'auth'
})

const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask: removeTask, moveTask: moveTaskStatus } = useTasks()
const companies = useCompanies()
const { tags: tagDefinitions, fetchTags } = useTags()

const loadingAction = ref(false)
const isTaskModalOpen = ref(false)
const selectedTask = ref<Task | null>(null)

const todoTasks = computed(() => tasks.value.filter(t => t.status === 'todo'))
const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'in_progress'))
const doneTasks = computed(() => tasks.value.filter(t => t.status === 'done'))

const openTaskModal = (task?: Task) => {
  selectedTask.value = task || null
  isTaskModalOpen.value = true
}

const closeTaskModal = () => {
  isTaskModalOpen.value = false
  selectedTask.value = null
}

const handleSaveTask = async (taskData: Task) => {
  loadingAction.value = true
  
  let res
  if (selectedTask.value?.id) {
    res = await updateTask(selectedTask.value.id, taskData)
  } else {
    res = await createTask(taskData)
  }

  if (res.success) {
    closeTaskModal()
  } else {
    alert('Erro ao salvar: ' + res.error)
  }
  
  loadingAction.value = false
}

const moveTask = async (task: Task, newStatus: 'todo' | 'in_progress' | 'done') => {
  if (!task.id) return
  await moveTaskStatus(task.id, newStatus)
}

const deleteTask = async (id: string) => {
  if (!confirm('Deseja realmente deletar esta tarefa?')) return
  await removeTask(id)
}

const syncData = async () => {
  await fetchTasks()
}

onMounted(async () => {
  await companies.fetchCompanies()
  await fetchTags()
  await fetchTasks()
})
</script>
