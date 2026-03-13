<template>
  <span 
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider transition-all',
      sizeClasses,
      variantClasses
    ]"
    :aria-label="`Status da assinatura: ${label}`"
    role="status"
  >
    <svg 
      v-if="showIcon" 
      xmlns="http://www.w3.org/2000/svg" 
      :width="iconSize" 
      :height="iconSize" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      stroke-width="3" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    >
      <component :is="iconPath" />
    </svg>
    <span v-if="showLabel">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type SubscriptionStatus = 'active' | 'suspended' | 'cancelled' | 'trial'
type BadgeSize = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  status: SubscriptionStatus
  size?: BadgeSize
  showIcon?: boolean
  showLabel?: boolean
}>(), {
  size: 'md',
  showIcon: true,
  showLabel: true
})

const label = computed(() => {
  const labels: Record<SubscriptionStatus, string> = {
    active: 'Ativa',
    suspended: 'Suspensa',
    cancelled: 'Cancelada',
    trial: 'Trial'
  }
  return labels[props.status] || 'N/A'
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[10px] px-2.5 py-1',
    lg: 'text-[11px] px-3 py-1.5'
  }
  return sizes[props.size]
})

const iconSize = computed(() => {
  const sizes = {
    sm: 8,
    md: 10,
    lg: 12
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants: Record<SubscriptionStatus, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    suspended: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    cancelled: 'bg-red-500/10 text-red-500 border border-red-500/20',
    trial: 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  }
  return variants[props.status] || 'bg-white/5 text-white/40 border border-white/10'
})

const iconPath = computed(() => {
  const icons: Record<SubscriptionStatus, any> = {
    active: () => h('polyline', { points: '20 6 9 17 4 12' }),
    suspended: () => [
      h('rect', { x: '6', y: '4', width: '4', height: '16' }),
      h('rect', { x: '14', y: '4', width: '4', height: '16' })
    ],
    cancelled: () => [
      h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
      h('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
    ],
    trial: () => h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' })
  }
  return icons[props.status]
})
</script>
