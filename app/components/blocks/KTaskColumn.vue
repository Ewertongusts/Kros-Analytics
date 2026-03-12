<template>
  <div class="bg-[#111112] border border-white/10 rounded-2xl p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xs font-bold uppercase tracking-widest text-white/70">{{ title }}</h3>
      <span :class="['px-2 py-1 text-xs font-bold rounded-full', badgeClass]">{{ tasks.length }}</span>
    </div>
    <div :class="['space-y-3', scrollClass]">
      <BlocksKTaskCard 
        v-for="task in tasks" 
        :key="task.id"
        :task="task"
        @edit="$emit('edit', task)"
        @move-left="$emit('move-left', task)"
        @move-right="$emit('move-right', task)"
        @reopen="$emit('reopen', task)"
        @delete="$emit('delete', task)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/composables/useTasks'

defineProps<{
  title: string
  tasks: Task[]
  badgeClass: string
  scrollClass?: string
}>()

defineEmits(['edit', 'move-left', 'move-right', 'reopen', 'delete'])
</script>
