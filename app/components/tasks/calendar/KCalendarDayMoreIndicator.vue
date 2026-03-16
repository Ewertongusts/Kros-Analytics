<template>
  <div v-if="count > 0" class="text-[8px] text-white/40 leading-none">
    +{{ count }}
  </div>
</template>

<script setup lang="ts">
defineProps<{ count: number }>()
</script>