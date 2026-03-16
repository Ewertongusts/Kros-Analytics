<template>
  <div :class="['text-xs font-semibold leading-none', isCurrentMonth ? 'text-white' : 'text-white/25', isToday ? 'text-blue-300' : '']">
    {{ date }}
  </div>
</template>

<script setup lang="ts">
defineProps<{ date: number; isCurrentMonth: boolean; isToday: boolean }>()
</script>