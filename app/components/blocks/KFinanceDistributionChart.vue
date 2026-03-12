<template>
  <div class="p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl">
    <div class="mb-6">
      <h3 class="text-sm font-black text-white uppercase tracking-widest">Distribuição por Status</h3>
      <p class="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Valores totais</p>
    </div>

    <div class="flex items-center justify-center gap-8">
      <!-- Donut Chart -->
      <div class="relative w-48 h-48">
        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          <!-- Background Circle -->
          <circle 
            cx="100" cy="100" r="80" 
            fill="none" 
            stroke="rgba(255,255,255,0.05)" 
            stroke-width="40"
          />
          
          <!-- Paid Segment -->
          <circle 
            v-if="paidPercentage > 0"
            cx="100" cy="100" r="80" 
            fill="none" 
            stroke="rgb(16, 185, 129)" 
            stroke-width="40"
            :stroke-dasharray="`${paidCircumference} ${totalCircumference}`"
            :stroke-dashoffset="0"
            class="transition-all duration-1000"
          />
          
          <!-- Pending Segment -->
          <circle 
            v-if="pendingPercentage > 0"
            cx="100" cy="100" r="80" 
            fill="none" 
            stroke="rgb(59, 130, 246)" 
            stroke-width="40"
            :stroke-dasharray="`${pendingCircumference} ${totalCircumference}`"
            :stroke-dashoffset="-paidCircumference"
            class="transition-all duration-1000"
          />
          
          <!-- Overdue Segment -->
          <circle 
            v-if="overduePercentage > 0"
            cx="100" cy="100" r="80" 
            fill="none" 
            stroke="rgb(239, 68, 68)" 
            stroke-width="40"
            :stroke-dasharray="`${overdueCircumference} ${totalCircumference}`"
            :stroke-dashoffset="-(paidCircumference + pendingCircumference)"
            class="transition-all duration-1000"
          />
          
          <!-- Churn Segment -->
          <circle 
            v-if="churnPercentage > 0"
            cx="100" cy="100" r="80" 
            fill="none" 
            stroke="rgb(249, 115, 22)" 
            stroke-width="40"
            :stroke-dasharray="`${churnCircumference} ${totalCircumference}`"
            :stroke-dashoffset="-(paidCircumference + pendingCircumference + overdueCircumference)"
            class="transition-all duration-1000"
          />
        </svg>
        
        <!-- Center Text -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-2xl font-black text-white">{{ totalCount }}</span>
          <span class="text-[8px] font-bold text-white/40 uppercase tracking-widest">Total</span>
        </div>
      </div>

      <!-- Legend -->
      <div class="space-y-3">
        <div v-if="paidPercentage > 0" class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-sm bg-emerald-500"></div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-white uppercase tracking-widest">Pago</span>
            <div class="flex items-baseline gap-2">
              <span class="text-sm font-black text-white">{{ formatCurrency(distribution.paid) }}</span>
              <span class="text-[8px] font-bold text-white/40">{{ paidPercentage }}%</span>
            </div>
          </div>
        </div>

        <div v-if="pendingPercentage > 0" class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-sm bg-blue-500"></div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-white uppercase tracking-widest">Pendente</span>
            <div class="flex items-baseline gap-2">
              <span class="text-sm font-black text-white">{{ formatCurrency(distribution.pending) }}</span>
              <span class="text-[8px] font-bold text-white/40">{{ pendingPercentage }}%</span>
            </div>
          </div>
        </div>

        <div v-if="overduePercentage > 0" class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-sm bg-red-500"></div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-white uppercase tracking-widest">Atrasado</span>
            <div class="flex items-baseline gap-2">
              <span class="text-sm font-black text-white">{{ formatCurrency(distribution.overdue) }}</span>
              <span class="text-[8px] font-bold text-white/40">{{ overduePercentage }}%</span>
            </div>
          </div>
        </div>

        <div v-if="churnPercentage > 0" class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-sm bg-orange-500"></div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-white uppercase tracking-widest">Churn</span>
            <div class="flex items-baseline gap-2">
              <span class="text-sm font-black text-white">{{ formatCurrency(distribution.churn) }}</span>
              <span class="text-[8px] font-bold text-white/40">{{ churnPercentage }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  payments: any[]
}>()

const distribution = computed(() => {
  return props.payments.reduce((acc, p) => {
    const amount = Number(p.amount) || 0
    if (p.status === 'Pago') {
      acc.paid += amount
    } else if (p.status === 'Pendente') {
      acc.pending += amount
    } else if (p.status === 'Atrasado') {
      acc.overdue += amount
    } else if (p.status === 'Churn') {
      acc.churn += amount
    }
    return acc
  }, { paid: 0, pending: 0, overdue: 0, churn: 0 })
})

const totalAmount = computed(() => {
  return distribution.value.paid + distribution.value.pending + distribution.value.overdue + distribution.value.churn
})

const totalCount = computed(() => {
  return props.payments.length
})

const paidPercentage = computed(() => {
  if (totalAmount.value === 0) return 0
  return Math.round((distribution.value.paid / totalAmount.value) * 100)
})

const pendingPercentage = computed(() => {
  if (totalAmount.value === 0) return 0
  return Math.round((distribution.value.pending / totalAmount.value) * 100)
})

const overduePercentage = computed(() => {
  if (totalAmount.value === 0) return 0
  return Math.round((distribution.value.overdue / totalAmount.value) * 100)
})

const churnPercentage = computed(() => {
  if (totalAmount.value === 0) return 0
  return Math.round((distribution.value.churn / totalAmount.value) * 100)
})

const totalCircumference = 2 * Math.PI * 80

const paidCircumference = computed(() => {
  return (paidPercentage.value / 100) * totalCircumference
})

const pendingCircumference = computed(() => {
  return (pendingPercentage.value / 100) * totalCircumference
})

const overdueCircumference = computed(() => {
  return (overduePercentage.value / 100) * totalCircumference
})

const churnCircumference = computed(() => {
  return (churnPercentage.value / 100) * totalCircumference
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>
