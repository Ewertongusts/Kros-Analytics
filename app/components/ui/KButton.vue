<template>
  <button
    :type="type"
    class="w-full bg-kros-blue hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
}>(), {
  type: 'button'
})
</script>
