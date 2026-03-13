<template>
  <LayoutsKPageLayout max-width="1800px">
    <UiKLoader 
      v-if="loading" 
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
        :companies="companies"
        :tag-definitions="tagDefinitions"
        :submitting="loadingAction"
        @close="closeTaskModal"
        @save="handleSaveTask"
      />
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { Task } from '~/composables/useTasks'
import { useTaskHandlers } from '~/composables/useTaskHandlers'

definePageMeta({
  middleware: 'auth'
})

const { tasks, loading, fetchTasks } = useTasks()
const { companies, fetchCompanies } = useCompanies()
const { tags: tagDefinitions, fetchTags } = useTags()

const {
  isTaskModalOpen,
  selectedTask,
  loadingAction,
  openTaskModal,
  closeTaskModal,
  handleSaveTask,
  moveTask,
  deleteTask
} = useTaskHandlers()

const todoTasks = computed(() => tasks.value.filter(t => t.status === 'todo'))
const inProgressTasks = computed(() => tasks.value.filter(t => t.status === 'in_progress'))
const doneTasks = computed(() => tasks.value.filter(t => t.status === 'done'))

const syncData = async () => {
  await fetchTasks()
}

onMounted(async () => {
  await fetchCompanies()
  await fetchTags()
  await fetchTasks()
})
</script>
