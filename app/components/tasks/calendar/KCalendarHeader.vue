<template>
  <div class="flex items-center justify-between gap-3 p-3 border-b border-white/10">
    <button
      @click="$emit('previous')"
      class="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    
    <h2 class="text-sm font-semibold text-white">
      {{ monthYear }}
    </h2>
    
    <button
      @click="$emit('next')"
      class="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <button
      @click="$emit('today')"
      class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
      :style="{ 
        backgroundColor: 'var(--kros-blue, #FF0000)',
        color: 'white',
        opacity: 0.85
      }"
      @mouseenter="$event.target.style.opacity = '1'"
      @mouseleave="$event.target.style.opacity = '0.85'"
    >
      Hoje
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  monthYear: string
}

defineProps<Props>()

defineEmits<{
  previous: []
  next: []
  today: []
}>()
</script>