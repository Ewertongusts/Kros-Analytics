<template>
  <button @click="$emit('click')" class="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath" />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineProps<{ iconPath: string }>()
defineEmits<{ click: [] }>()
</script>