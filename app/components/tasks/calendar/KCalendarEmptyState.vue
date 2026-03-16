<template>
  <div class="text-center py-6">
    <svg class="w-8 h-8 text-white/20 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
    <p class="text-xs text-white/40">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string }>()
</script>