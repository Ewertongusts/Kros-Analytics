<template>
  <div
    :class="[
      'flex items-center justify-center rounded-full font-bold text-white text-xs uppercase transition-all',
      sizeClasses,
      bgColorClass
    ]"
    :title="name"
  >
    {{ initials }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>()

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  }
  return sizes[props.size || 'sm']
})

const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2)
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

const bgColorClass = computed(() => {
  // Gerar cor baseada no nome (determinístico)
  const colors = [
    'bg-blue-500/70',
    'bg-purple-500/70',
    'bg-pink-500/70',
    'bg-red-500/70',
    'bg-orange-500/70',
    'bg-yellow-500/70',
    'bg-green-500/70',
    'bg-cyan-500/70',
    'bg-indigo-500/70',
    'bg-rose-500/70'
  ]
  
  let hash = 0
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
})
</script>
