<template>
  <div class="flex items-center gap-1.5">
    <div class="w-2 h-2 rounded-full" :class="colorClass"></div>
    <span>{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ colorClass: string; label: string }>()
</script>