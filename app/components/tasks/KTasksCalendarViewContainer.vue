<template>
  <div class="mb-20 -mx-6 -mt-6 px-6 pt-6 bg-black">
    <div class="w-full max-w-3xl mx-auto">
      <TasksKTasksCalendarView
        :tasks="tasks"
        @select="$emit('open-task-modal', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'

defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  'open-task-modal': [task: Task]
}>()
</script>
