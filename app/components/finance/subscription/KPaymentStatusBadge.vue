<template>
  <span 
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider transition-all',
      sizeClasses,
      variantClasses
    ]"
    :aria-label="`Status do pagamento: ${label}`"
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

type PaymentStatus = 'paid' | 'pending' | 'overdue'
type BadgeSize = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  status: PaymentStatus
  size?: BadgeSize
  showIcon?: boolean
  showLabel?: boolean
}>(), {
  size: 'md',
  showIcon: true,
  showLabel: true
})

const label = computed(() => {
  const labels: Record<PaymentStatus, string> = {
    paid: 'Pago',
    pending: 'Pendente',
    overdue: 'Atrasado'
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
  const variants: Record<PaymentStatus, string> = {
    paid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    overdue: 'bg-red-500/10 text-red-500 border border-red-500/20'
  }
  return variants[props.status] || 'bg-white/5 text-white/40 border border-white/10'
})

const iconPath = computed(() => {
  const icons: Record<PaymentStatus, any> = {
    paid: () => h('polyline', { points: '20 6 9 17 4 12' }),
    pending: () => [
      h('circle', { cx: '12', cy: '12', r: '10' }),
      h('polyline', { points: '12 6 12 12 16 14' })
    ],
    overdue: () => [
      h('path', { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }),
      h('path', { d: 'M12 9v4' }),
      h('path', { d: 'M12 17h.01' })
    ]
  }
  return icons[props.status]
})
</script>
