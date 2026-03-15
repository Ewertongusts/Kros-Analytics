<template>
  <div class="space-y-6">
    <!-- Métricas Principais -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
      <div class="p-4 bg-white/5 border border-white/10 rounded-xl">
        <p class="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">📊 Total</p>
        <p class="text-2xl font-black text-white">{{ totalTasks }}</p>
      </div>
      <div class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p class="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">📋 A Fazer</p>
        <p class="text-2xl font-black text-blue-400">{{ todoCount }}</p>
      </div>
      <div class="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <p class="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-2">⚙️ Em Andamento</p>
        <p class="text-2xl font-black text-yellow-400">{{ inProgressCount }}</p>
      </div>
      <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <p class="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">✅ Concluído</p>
        <p class="text-2xl font-black text-emerald-400">{{ doneCount }}</p>
      </div>
      <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p class="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">⚠️ Atrasadas</p>
        <p class="text-2xl font-black text-red-400">{{ overdueTasks }}</p>
      </div>
      <div class="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
        <p class="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">📈 Taxa</p>
        <p class="text-2xl font-black text-purple-400">{{ completionRate }}%</p>
      </div>
    </div>

    <!-- Gráficos e Distribuições -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Distribuição por Status -->
      <div class="p-6 bg-white/5 border border-white/10 rounded-xl">
        <div class="flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          <h3 class="text-sm font-bold text-white uppercase tracking-widest">Distribuição por Status</h3>
        </div>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs text-blue-400">📋 A Fazer</span>
              <span class="text-xs font-bold text-blue-400">{{ todoCount }}</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
              <div class="bg-blue-500 h-2 rounded-full" :style="{ width: statusPercentage.todo + '%' }"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs text-yellow-400">⚙️ Em Andamento</span>
              <span class="text-xs font-bold text-yellow-400">{{ inProgressCount }}</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
              <div class="bg-yellow-500 h-2 rounded-full" :style="{ width: statusPercentage.inProgress + '%' }"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs text-emerald-400">✅ Concluído</span>
              <span class="text-xs font-bold text-emerald-400">{{ doneCount }}</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
              <div class="bg-emerald-500 h-2 rounded-full" :style="{ width: statusPercentage.done + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribuição por Prioridade -->
      <div class="p-6 bg-white/5 border border-white/10 rounded-xl">
        <div class="flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400"><polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.09 24.96 12 18.53 3.91 24.96 6.82 16.70 0 10.27 8.91 10.26 12 2"/></svg>
          <h3 class="text-sm font-bold text-white uppercase tracking-widest">Distribuição por Prioridade</h3>
        </div>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs text-red-400">🔴 Alta</span>
              <span class="text-xs font-bold text-red-400">{{ priorityCount.alta }}</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
              <div class="bg-red-500 h-2 rounded-full" :style="{ width: priorityPercentage.alta + '%' }"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs text-orange-400">🟡 Média</span>
              <span class="text-xs font-bold text-orange-400">{{ priorityCount.media }}</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
              <div class="bg-orange-500 h-2 rounded-full" :style="{ width: priorityPercentage.media + '%' }"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-xs text-green-400">🟢 Baixa</span>
              <span class="text-xs font-bold text-green-400">{{ priorityCount.baixa }}</span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
              <div class="bg-green-500 h-2 rounded-full" :style="{ width: priorityPercentage.baixa + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tempo Médio e Responsáveis -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Tempo Médio em Andamento -->
      <div class="p-6 bg-white/5 border border-white/10 rounded-xl">
        <div class="flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-kros-blue"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <h3 class="text-sm font-bold text-white uppercase tracking-widest">Tempo Médio em Andamento</h3>
        </div>
        <div class="flex items-end gap-4">
          <div>
            <p class="text-4xl font-black text-kros-blue">{{ averageTimeInProgress }}</p>
            <p class="text-xs text-white/50 mt-1">horas</p>
          </div>
          <p class="text-xs text-white/50 mb-2">{{ inProgressCount }} tarefa{{ inProgressCount !== 1 ? 's' : '' }} em andamento</p>
        </div>
      </div>

      <!-- Top Responsáveis -->
      <div class="p-6 bg-white/5 border border-white/10 rounded-xl">
        <div class="flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <h3 class="text-sm font-bold text-white uppercase tracking-widest">Tarefas por Responsável</h3>
        </div>
        <div class="space-y-2">
          <div v-for="(count, person) in topAssignees" :key="person" class="flex items-center justify-between">
            <span class="text-xs text-white/70">👤 {{ person }}</span>
            <span class="px-2 py-1 bg-kros-blue/20 text-kros-blue rounded text-xs font-bold">{{ count }}</span>
          </div>
          <div v-if="Object.keys(topAssignees).length === 0" class="text-xs text-white/50">
            Nenhuma tarefa atribuída
          </div>
        </div>
      </div>
    </div>

    <!-- Estimativas de Tempo -->
    <TasksKTimeEstimationStats :tasks="tasks" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskReports } from '~/composables/useTaskReports'

const props = defineProps<{
  tasks: any[]
}>()

const { getTotalByStatus, getTotalByPriority, getCompletionRate, getAverageTimeInProgress, getTasksByAssignee } = useTaskReports()

const totalTasks = computed(() => props.tasks.length)
const todoCount = computed(() => props.tasks.filter(t => t.status === 'todo').length)
const inProgressCount = computed(() => props.tasks.filter(t => t.status === 'in_progress').length)
const doneCount = computed(() => props.tasks.filter(t => t.status === 'done').length)
const completionRate = computed(() => getCompletionRate(props.tasks))
const overdueTasks = computed(() => props.tasks.filter(task => {
  if (!task.due_date || task.status === 'done') return false
  return new Date(task.due_date) < new Date()
}).length)

const averageTimeInProgress = computed(() => getAverageTimeInProgress(props.tasks))

const statusPercentage = computed(() => {
  const total = totalTasks.value || 1
  return {
    todo: Math.round((todoCount.value / total) * 100),
    inProgress: Math.round((inProgressCount.value / total) * 100),
    done: Math.round((doneCount.value / total) * 100)
  }
})

const priorityCount = computed(() => getTotalByPriority(props.tasks))

const priorityPercentage = computed(() => {
  const total = totalTasks.value || 1
  return {
    alta: Math.round((priorityCount.value.alta / total) * 100),
    media: Math.round((priorityCount.value.media / total) * 100),
    baixa: Math.round((priorityCount.value.baixa / total) * 100)
  }
})

const assigneeCount = computed(() => getTasksByAssignee(props.tasks))

const topAssignees = computed(() => {
  const sorted = Object.entries(assigneeCount.value)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
  return Object.fromEntries(sorted)
})
</script>
