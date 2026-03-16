<template>
  <button @click="$emit('click')" class="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors" title="Nova tarefa">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
  </button>
</template>

<script setup lang="ts">
defineEmits<{ click: [] }>()
</script>