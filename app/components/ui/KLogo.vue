<template>
  <div class="flex items-center gap-3">
    <span v-if="!hideText" class="font-bold text-lg tracking-wide hidden sm:block">Kros</span>
    <div 
      class="rounded-lg bg-kros-surface dark:bg-[#1A1A1A] flex items-center justify-center overflow-hidden border border-kros-outline dark:border-[#333333]"
      :class="[sizeClass]"
    >
      <img src="/logo.png" alt="Kros Logo" class="w-full h-full object-cover" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  hideText?: boolean
}>(), {
  size: 'md',
  hideText: false
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-8 h-8'
    case 'lg': return 'w-12 h-12'
    case 'md':
    default: return 'w-10 h-10'
  }
})
</script>
