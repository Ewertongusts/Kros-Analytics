<template>
  <div v-if="progress > 0" class="space-y-4 pt-2">
    <div class="space-y-2">
      <div class="flex justify-between items-baseline px-1">
        <span class="text-[10px] font-black text-white/30 uppercase">Status do Envio</span>
        <span class="text-xs font-black text-kros-blue">{{ percentage }}%</span>
      </div>
      <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div class="h-full bg-kros-blue transition-all duration-300" :style="{ width: percentage + '%' }"></div>
      </div>
    </div>
    
    <div v-if="countdown > 0" class="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-center justify-between">
      <p class="text-[9px] font-black text-emerald-500 uppercase">Resfriamento Anti-Ban</p>
      <span class="text-xs font-black text-white tabular-nums">{{ countdown }}s</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  progress: number
  total: number
  countdown: number
}>()

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.progress / props.total) * 100)
})
</script>
