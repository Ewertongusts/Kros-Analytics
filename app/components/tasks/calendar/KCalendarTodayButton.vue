<template>
  <button @click="$emit('click')" class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all" :style="{ backgroundColor: 'var(--kros-blue, #FF0000)', color: 'white', opacity: 0.85 }" @mouseenter="$event.target.style.opacity = '1'" @mouseleave="$event.target.style.opacity = '0.85'">
    Hoje
  </button>
</template>

<script setup lang="ts">
defineEmits<{ click: [] }>()
</script>