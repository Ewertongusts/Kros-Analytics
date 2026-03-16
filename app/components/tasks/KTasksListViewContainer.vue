<template>
  <div class="space-y-6 mb-20 pt-20">
    <TasksKTasksListView
      :tasks="tasks"
      :columns="columns"
      :is-task-selected="isTaskSelected"
      :toggle-task-selection="toggleTaskSelection"
      @edit="$emit('open-task-modal', $event)"
      @delete="$emit('delete-task', $event.id)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'
import { useTaskSelection } from '~/composables/useTaskSelection'

defineProps<{
  tasks: Task[]
  columns: any[]
}>()

const emit = defineEmits<{
  'open-task-modal': [task: Task]
  'delete-task': [taskId: string]
}>()

const { isTaskSelected, toggleTaskSelection } = useTaskSelection()
</script>
