<template>
  <div class="flex items-center gap-1.5 mt-1">
    <div class="w-2 h-2 rounded-full" :class="getPriorityColor(priority)"></div>
    <span class="text-xs text-white/50 capitalize">{{ priority }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ priority: string }>()

const getPriorityColor = (priority: string): string => {
  return priority === 'alta' ? 'bg-red-500' :
         priority === 'media' ? 'bg-yellow-500' :
         'bg-blue-500'
}
</script>