<template>
  <div class="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/10">
    <div class="relative flex items-center justify-center w-2.5 h-2.5">
      <div :class="[
        'absolute inset-0 rounded-full animate-ping opacity-20',
        statusClass
      ]"></div>
      <div :class="[
        'w-2 h-2 rounded-full relative z-10',
        statusClass,
        statusShadow
      ]"></div>
    </div>
    <span class="text-[9px] font-bold uppercase tracking-widest" :class="textClass">
      {{ statusText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

const props = defineProps<{
  status?: string
}>()

// Log para debug
watch(() => props.status, (newStatus) => {
  console.log('🎯 [KCrmStatusIndicator] Status mudou para:', newStatus)
}, { immediate: true })

const statusClass = computed(() => {
  if (props.status === 'success') return 'bg-emerald-500'
  if (props.status === 'error') return 'bg-red-500'
  return 'bg-white/20'
})

const statusShadow = computed(() => {
  if (props.status === 'success') return 'shadow-[0_0_10px_rgba(16,185,129,0.5)]'
  if (props.status === 'error') return 'shadow-[0_0_10px_rgba(239,68,68,0.5)]'
  return ''
})

const textClass = computed(() => {
  if (props.status === 'success') return 'text-emerald-400'
  if (props.status === 'error') return 'text-red-400'
  return 'text-white/40'
})

const statusText = computed(() => {
  if (props.status === 'success') return 'WhatsApp Conectado'
  if (props.status === 'error') return 'Falha na Conexão'
  return 'Não Testado'
})
</script>
