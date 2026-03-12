<template>
  <div class="p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-sm font-black text-white uppercase tracking-widest">Evolução de Cobranças</h3>
        <p class="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Últimos 6 meses</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span class="text-[9px] font-bold text-white/50 uppercase">Pago</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-blue-500"></div>
          <span class="text-[9px] font-bold text-white/50 uppercase">Pendente</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-2 h-2 rounded-full bg-red-500"></div>
          <span class="text-[9px] font-bold text-white/50 uppercase">Atrasado</span>
        </div>
      </div>
    </div>

    <div class="relative h-64">
      <svg class="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
        <!-- Grid Lines -->
        <line v-for="i in 5" :key="'grid-' + i" 
          :x1="0" :y1="i * 40" :x2="600" :y2="i * 40" 
          stroke="rgba(255,255,255,0.05)" stroke-width="1" />
        
        <!-- Paid Line -->
        <polyline 
          :points="paidPoints" 
          fill="none" 
          stroke="rgb(16, 185, 129)" 
          stroke-width="3" 
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        
        <!-- Pending Line -->
        <polyline 
          :points="pendingPoints" 
          fill="none" 
          stroke="rgb(59, 130, 246)" 
          stroke-width="3" 
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        
        <!-- Overdue Line -->
        <polyline 
          :points="overduePoints" 
          fill="none" 
          stroke="rgb(239, 68, 68)" 
          stroke-width="3" 
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        
        <!-- Data Points -->
        <circle v-for="(point, idx) in paidPointsArray" :key="'paid-' + idx"
          :cx="point.x" :cy="point.y" r="4" 
          fill="rgb(16, 185, 129)" 
          class="cursor-pointer hover:r-6 transition-all"
        />
        <circle v-for="(point, idx) in pendingPointsArray" :key="'pending-' + idx"
          :cx="point.x" :cy="point.y" r="4" 
          fill="rgb(59, 130, 246)" 
          class="cursor-pointer hover:r-6 transition-all"
        />
        <circle v-for="(point, idx) in overduePointsArray" :key="'overdue-' + idx"
          :cx="point.x" :cy="point.y" r="4" 
          fill="rgb(239, 68, 68)" 
          class="cursor-pointer hover:r-6 transition-all"
        />
      </svg>

      <!-- X-Axis Labels -->
      <div class="absolute bottom-0 left-0 right-0 flex justify-between px-2 -mb-6">
        <span v-for="month in monthLabels" :key="month" 
          class="text-[8px] font-bold text-white/30 uppercase tracking-widest">
          {{ month }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  payments: any[]
}>()

const monthLabels = computed(() => {
  const labels = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''))
  }
  return labels
})

const monthlyData = computed(() => {
  const data = []
  const now = new Date()
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = monthDate.getMonth()
    const year = monthDate.getFullYear()
    
    const monthPayments = props.payments.filter(p => {
      const dueDate = p.due_date ? new Date(p.due_date) : null
      return dueDate && dueDate.getMonth() === month && dueDate.getFullYear() === year
    })
    
    data.push({
      paid: monthPayments.filter(p => p.status === 'Pago').reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      pending: monthPayments.filter(p => p.status === 'Pendente').reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
      overdue: monthPayments.filter(p => p.status === 'Atrasado' || p.status === 'Churn').reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    })
  }
  
  return data
})

const maxValue = computed(() => {
  const allValues = monthlyData.value.flatMap(d => [d.paid, d.pending, d.overdue])
  return Math.max(...allValues, 1000)
})

const normalizeY = (value: number) => {
  return 180 - (value / maxValue.value) * 160
}

const paidPointsArray = computed(() => {
  return monthlyData.value.map((d, i) => ({
    x: (i * 100) + 50,
    y: normalizeY(d.paid)
  }))
})

const pendingPointsArray = computed(() => {
  return monthlyData.value.map((d, i) => ({
    x: (i * 100) + 50,
    y: normalizeY(d.pending)
  }))
})

const overduePointsArray = computed(() => {
  return monthlyData.value.map((d, i) => ({
    x: (i * 100) + 50,
    y: normalizeY(d.overdue)
  }))
})

const paidPoints = computed(() => {
  return paidPointsArray.value.map(p => `${p.x},${p.y}`).join(' ')
})

const pendingPoints = computed(() => {
  return pendingPointsArray.value.map(p => `${p.x},${p.y}`).join(' ')
})

const overduePoints = computed(() => {
  return overduePointsArray.value.map(p => `${p.x},${p.y}`).join(' ')
})
</script>
