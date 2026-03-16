<template>
  <h4 class="text-xs font-medium text-white truncate">{{ title }}</h4>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>