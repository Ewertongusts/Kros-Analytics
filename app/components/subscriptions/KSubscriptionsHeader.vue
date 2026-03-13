<template>
  <BlocksKPageHeader>
  </BlocksKPageHeader>
</template>

<script setup lang="ts">
defineProps<{
  showCharts: boolean
}>()

defineEmits<{
  'toggle-charts': []
  'open-timeline': []
  'create-subscription': []
}>()
</script>
