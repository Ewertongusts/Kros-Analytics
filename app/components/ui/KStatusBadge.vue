<template>
  <span 
    :class="[
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest',
      variantClass
    ]"
  >
    <span :class="['w-1.5 h-1.5 rounded-full', dotClass]"></span>
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  label?: string
}>()

const variantClass = computed(() => {
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-500',
    warning: 'bg-yellow-500/10 text-yellow-500',
    danger: 'bg-red-500/10 text-red-500',
    info: 'bg-blue-500/10 text-blue-500',
    neutral: 'bg-white/10 text-white/60'
  }
  return variants[props.variant || 'neutral']
})

const dotClass = computed(() => {
  const dots = {
    success: 'bg-emerald-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-white/60'
  }
  return dots[props.variant || 'neutral']
})
</script>
