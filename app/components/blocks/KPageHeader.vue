<template>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-black text-white uppercase tracking-tight">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-xs text-white/40 uppercase tracking-widest font-medium mt-1">
        {{ subtitle }}
      </p>
    </div>
    <slot name="actions"></slot>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>
