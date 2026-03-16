<template>
  <div class="flex-1 flex flex-col gap-0.5 mt-1 overflow-hidden">
    <div v-for="task in tasks.slice(0, 1)" :key="task.id" class="text-[10px] px-1 py-0.5 rounded truncate leading-none" :class="getTaskClasses(task.priority)" :title="task.title" @click.stop="$emit('select', task)">
      {{ task.title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'
import { getTaskClasses } from '~/utils/calendarUtils'

defineProps<{ tasks: Task[] }>()
defineEmits<{ select: [task: Task] }>()
</script>