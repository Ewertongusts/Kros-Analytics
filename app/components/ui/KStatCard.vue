<template>
  <div class="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-300">
    <div class="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    
    <div class="flex justify-between items-start mb-4">
      <div class="bg-white/10 rounded-lg p-2 text-white">
        <slot name="icon">
          <!-- Default fallback icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          </svg>
        </slot>
      </div>
      <div v-if="trend" class="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
        {{ trend }}
      </div>
    </div>
    
    <div>
      <p class="text-sm text-gray-400 font-medium mb-1">{{ title }}</p>
      <h3 class="text-2xl font-bold text-white tracking-tight">{{ value }}</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  trend?: string
}>()
</script>
