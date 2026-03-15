<template>
  <div class="space-y-3">
    <h3 class="text-sm font-bold text-white uppercase tracking-widest">⏱️ Estimativas de Tempo</h3>
    
    <div class="grid grid-cols-2 gap-3">
      <!-- Total Estimado -->
      <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div class="text-xs text-blue-300 mb-1">Total Estimado</div>
        <div class="text-lg font-bold text-blue-400">{{ totalEstimatedFormatted }}</div>
        <div class="text-[10px] text-blue-300/70 mt-1">{{ totalTasksWithEstimation }} tarefas</div>
      </div>

      <!-- Média por Tarefa -->
      <div class="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
        <div class="text-xs text-cyan-300 mb-1">Média por Tarefa</div>
        <div class="text-lg font-bold text-cyan-400">{{ averageEstimationFormatted }}</div>
        <div class="text-[10px] text-cyan-300/70 mt-1">{{ totalTasks }} tarefas</div>
      </div>

      <!-- Por Status -->
      <div class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div class="text-xs text-yellow-300 mb-1">A Fazer</div>
        <div class="text-lg font-bold text-yellow-400">{{ todoEstimatedFormatted }}</div>
        <div class="text-[10px] text-yellow-300/70 mt-1">{{ todoCount }} tarefas</div>
      </div>

      <div class="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <div class="text-xs text-orange-300 mb-1">Em Andamento</div>
        <div class="text-lg font-bold text-orange-400">{{ inProgressEstimatedFormatted }}</div>
        <div class="text-[10px] text-orange-300/70 mt-1">{{ inProgressCount }} tarefas</div>
      </div>
    </div>

    <!-- Breakdown por Prioridade -->
    <div class="space-y-2">
      <h4 class="text-xs font-bold text-white/70 uppercase tracking-widest">Por Prioridade</h4>
      <div class="space-y-1">
        <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
          <span class="text-xs text-red-400 font-bold">Alta</span>
          <span class="text-xs font-bold text-white">{{ highPriorityFormatted }}</span>
        </div>
        <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
          <span class="text-xs text-yellow-400 font-bold">Média</span>
          <span class="text-xs font-bold text-white">{{ mediumPriorityFormatted }}</span>
        </div>
        <div class="flex items-center justify-between p-2 bg-white/5 rounded-lg">
          <span class="text-xs text-green-400 font-bold">Baixa</span>
          <span class="text-xs font-bold text-white">{{ lowPriorityFormatted }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTimeEstimation } from '~/composables/useTimeEstimation'

interface Props {
  tasks: any[]
}

const props = defineProps<Props>()

const { formatEstimation, getHours, calculateTotalTime } = useTimeEstimation()

const totalTasks = computed(() => props.tasks.length)

const totalTasksWithEstimation = computed(() => 
  props.tasks.filter(t => t.estimated_hours || t.estimated_days).length
)

const totalEstimatedHours = computed(() => 
  calculateTotalTime(
    props.tasks.map(t => ({
      estimated_hours: t.estimated_hours,
      estimated_days: t.estimated_days,
      time_unit: t.time_unit || 'hours'
    })),
    'hours'
  )
)

const totalEstimatedFormatted = computed(() => {
  const hours = totalEstimatedHours.value
  if (hours === 0) return '-'
  if (hours < 8) return `${hours.toFixed(1)}h`
  const days = Math.floor(hours / 8)
  const remainingHours = hours % 8
  return remainingHours > 0 ? `${days}d ${remainingHours.toFixed(1)}h` : `${days}d`
})

const averageEstimation = computed(() => {
  if (totalTasks.value === 0) return 0
  return totalEstimatedHours.value / totalTasks.value
})

const averageEstimationFormatted = computed(() => {
  const hours = averageEstimation.value
  if (hours === 0) return '-'
  return `${hours.toFixed(1)}h`
})

const todoCount = computed(() => 
  props.tasks.filter(t => t.status === 'todo').length
)

const todoEstimatedHours = computed(() => 
  calculateTotalTime(
    props.tasks
      .filter(t => t.status === 'todo')
      .map(t => ({
        estimated_hours: t.estimated_hours,
        estimated_days: t.estimated_days,
        time_unit: t.time_unit || 'hours'
      })),
    'hours'
  )
)

const todoEstimatedFormatted = computed(() => {
  const hours = todoEstimatedHours.value
  if (hours === 0) return '-'
  if (hours < 8) return `${hours.toFixed(1)}h`
  const days = Math.floor(hours / 8)
  const remainingHours = hours % 8
  return remainingHours > 0 ? `${days}d ${remainingHours.toFixed(1)}h` : `${days}d`
})

const inProgressCount = computed(() => 
  props.tasks.filter(t => t.status === 'in_progress').length
)

const inProgressEstimatedHours = computed(() => 
  calculateTotalTime(
    props.tasks
      .filter(t => t.status === 'in_progress')
      .map(t => ({
        estimated_hours: t.estimated_hours,
        estimated_days: t.estimated_days,
        time_unit: t.time_unit || 'hours'
      })),
    'hours'
  )
)

const inProgressEstimatedFormatted = computed(() => {
  const hours = inProgressEstimatedHours.value
  if (hours === 0) return '-'
  if (hours < 8) return `${hours.toFixed(1)}h`
  const days = Math.floor(hours / 8)
  const remainingHours = hours % 8
  return remainingHours > 0 ? `${days}d ${remainingHours.toFixed(1)}h` : `${days}d`
})

const highPriorityFormatted = computed(() => {
  const hours = calculateTotalTime(
    props.tasks
      .filter(t => t.priority === 'alta')
      .map(t => ({
        estimated_hours: t.estimated_hours,
        estimated_days: t.estimated_days,
        time_unit: t.time_unit || 'hours'
      })),
    'hours'
  )
  if (hours === 0) return '-'
  return `${hours.toFixed(1)}h`
})

const mediumPriorityFormatted = computed(() => {
  const hours = calculateTotalTime(
    props.tasks
      .filter(t => t.priority === 'media')
      .map(t => ({
        estimated_hours: t.estimated_hours,
        estimated_days: t.estimated_days,
        time_unit: t.time_unit || 'hours'
      })),
    'hours'
  )
  if (hours === 0) return '-'
  return `${hours.toFixed(1)}h`
})

const lowPriorityFormatted = computed(() => {
  const hours = calculateTotalTime(
    props.tasks
      .filter(t => t.priority === 'baixa')
      .map(t => ({
        estimated_hours: t.estimated_hours,
        estimated_days: t.estimated_days,
        time_unit: t.time_unit || 'hours'
      })),
    'hours'
  )
  if (hours === 0) return '-'
  return `${hours.toFixed(1)}h`
})
</script>
