<template>
  <div class="min-h-screen p-8 md:p-12">
    <div :class="['mx-auto space-y-8', maxWidthClass]">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  maxWidth?: '7xl' | '1800px'
}>()

const maxWidthClass = computed(() => {
  const maxWidth = props.maxWidth || '7xl'
  return maxWidth === '1800px' ? 'max-w-[1800px]' : 'max-w-7xl'
})
</script>
