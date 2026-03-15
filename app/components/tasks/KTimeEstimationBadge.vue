<template>
  <div v-if="task.estimated_hours || task.estimated_days" class="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded-lg">
    <span class="text-xs">{{ icon }}</span>
    <span :class="['text-xs font-bold', color]">{{ formatted }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTimeEstimation } from '~/composables/useTimeEstimation'

interface Props {
  task: any
}

const props = defineProps<Props>()

const { formatEstimation, getEstimationColor, getEstimationIcon } = useTimeEstimation()

const estimation = computed(() => ({
  estimated_hours: props.task.estimated_hours,
  estimated_days: props.task.estimated_days,
  time_unit: props.task.time_unit || 'hours'
}))

const formatted = computed(() => formatEstimation(estimation.value))
const color = computed(() => getEstimationColor(estimation.value))
const icon = computed(() => getEstimationIcon(estimation.value))
</script>
