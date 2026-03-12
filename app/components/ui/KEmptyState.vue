<template>
  <div class="flex flex-col items-center justify-center py-20 opacity-40">
    <div v-if="icon === 'search'" class="mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.3-4.3"></path>
      </svg>
    </div>
    
    <div v-else-if="icon === 'box'" class="mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-white">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      </svg>
    </div>
    
    <div v-else-if="icon === 'loading'" class="p-8 bg-white/5 rounded-3xl mb-6">
      <div class="w-16 h-16 border-4 border-dashed border-kros-blue/40 rounded-2xl animate-[spin_4s_linear_infinite]"></div>
    </div>
    
    <div v-else class="mb-6">
      <slot name="icon" />
    </div>
    
    <p class="text-sm font-bold uppercase tracking-widest text-white">
      <slot>{{ message }}</slot>
    </p>
    
    <p v-if="description" class="text-[10px] text-white/40 uppercase tracking-widest mt-2">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon?: 'search' | 'box' | 'loading' | 'custom'
  message?: string
  description?: string
}>()
</script>
