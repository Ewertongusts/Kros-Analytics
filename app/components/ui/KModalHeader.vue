<template>
  <div class="mb-6 text-center">
    <h3 class="text-xl font-bold uppercase tracking-tight text-white">
      <slot name="title">
        {{ title }}
      </slot>
    </h3>
    <p v-if="subtitle || $slots.subtitle" class="text-[10px] text-white/40 uppercase tracking-widest mt-2">
      <slot name="subtitle">{{ subtitle }}</slot>
    </p>
    <div class="h-1 w-8 bg-kros-blue mx-auto mt-3 rounded-full"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>
