<template>
  <div class="p-6 rounded-2xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-indigo-500/10 transition-all">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="font-bold text-lg text-kros-text dark:text-kros-surface">Evolução de Despesas</h3>
        <p class="text-xs text-kros-text/60 dark:text-white/60 tracking-wide mt-1 uppercase">Monitoramento de Custos Operacionais e Infra</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <span class="text-[10px] font-bold opacity-80 text-white uppercase tracking-tighter">Despesas Totais</span>
        </div>
      </div>
    </div>
    
    <div class="h-[320px] w-full bg-kros-main/20 dark:bg-black/10 rounded-2xl border border-kros-outline dark:border-[#1F1F21]/40 relative flex flex-col justify-end p-4 group/chart">
        <!-- Linhas de Base (Grid) -->
        <div class="absolute inset-0 flex flex-col justify-between py-8 px-4 opacity-20 pointer-events-none">
          <div v-for="i in 4" :key="i" class="border-b border-kros-text/10 dark:border-kros-surface/10 w-full"></div>
        </div>

        <!-- Linha Vertical de Hover -->
        <div v-if="hoveredPoint" 
             class="absolute top-0 bottom-0 w-px bg-indigo-500/30 z-0 pointer-events-none"
             :style="{ left: (hoveredPoint.x / 10) + '%' }">
        </div>

        <!-- Tooltip Flutuante -->
        <div v-if="hoveredPoint" 
             class="absolute z-30 pointer-events-none transition-all duration-200"
             :style="{ left: (hoveredPoint.x / 10) + '%', top: ((hoveredPoint.y / 300) * 100) - 15 + '%', transform: 'translateX(-50%)' }">
            <div class="bg-kros-text dark:bg-white text-kros-main dark:text-kros-text px-4 py-2.5 rounded-xl shadow-2xl text-[10px] whitespace-nowrap border border-white/10 min-w-[140px]">
               <div class="font-black text-[11px] mb-2 border-b border-indigo-500/10 pb-1 opacity-60 uppercase tracking-widest text-indigo-500">
                  {{ months[hoveredPoint.idx] }} 2026
               </div>
               <div class="space-y-1.5">
                  <div class="flex items-center justify-between gap-4">
                     <div class="flex items-center gap-1.5 opacity-70 font-bold">
                        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        Gasto Total:
                     </div>
                     <span class="font-black text-[11px] tracking-tighter text-indigo-600">{{ formatCurrency(2000 + hoveredPoint.val * 85) }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-4 pt-1">
                     <div class="flex items-center gap-1.5 opacity-70 font-bold">
                        <span class="text-[10px]">🏢</span> Infraestrutura:
                     </div>
                     <span class="font-bold text-[10px] opacity-80">{{ formatCurrency((2000 + hoveredPoint.val * 85) * 0.7) }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                     <div class="flex items-center gap-1.5 opacity-70 font-bold">
                        <span class="text-[10px]">🔧</span> APIs & SaaS:
                     </div>
                     <span class="font-bold text-[10px] opacity-80">{{ formatCurrency((2000 + hoveredPoint.val * 85) * 0.3) }}</span>
                  </div>
               </div>
            </div>
        </div>

        <!-- SVG do Gráfico de Linha (Despesas) -->
        <svg class="w-full h-full relative z-10 overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
           <defs>
             <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stop-color="#6366F1" stop-opacity="0.25" />
               <stop offset="100%" stop-color="#6366F1" stop-opacity="0" />
             </linearGradient>
           </defs>
           
           <!-- Área preenchida -->
           <path 
              :d="expenseAreaPath" 
              fill="url(#expenseFill)" 
              class="transition-all duration-1000 ease-out"
           />
           
           <!-- Linha principal -->
           <path 
              :d="expenseLinePath" 
              fill="none" 
              stroke="#6366F1" 
              stroke-width="3.5" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              class="transition-all duration-1000 ease-out"
           />

           <!-- Pontos Interativos -->
           <g v-for="(p, idx) in chartPoints" :key="idx" 
              @mouseenter="hoveredPoint = { ...p, idx }" 
              @mouseleave="hoveredPoint = null"
              class="group/point">
              <circle 
                 :cx="p.x" 
                 :cy="p.y" 
                 r="5" 
                 fill="#6366F1" 
                 :class="['transition-all duration-200 cursor-pointer', hoveredPoint?.idx === idx ? 'opacity-100 scale-125' : 'opacity-0 group-hover/point:opacity-100']"
              />
              <circle 
                 :cx="p.x" :cy="p.y" r="25" 
                 fill="transparent" 
                 class="cursor-pointer"
              />
           </g>
        </svg>

        <!-- Marcadores de Meses -->
        <div class="flex justify-between px-2 pt-4 relative z-10 border-t border-kros-text/5 dark:border-kros-surface/5 mt-4">
           <span v-for="m in months" 
                 :key="m" 
                 class="text-[9px] font-bold text-kros-text/30 dark:text-kros-surface/30 uppercase tracking-widest">
              {{ m }}
           </span>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  stats: any
}>()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const hoveredPoint = ref<any>(null)
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// Dados simulados de despesas (voláteis)
const rawExpenseData = [40, 45, 42, 55, 58, 52, 60, 65, 62, 70, 75, 72]
const width = 1000
const height = 300
const paddingY = 60

const chartPoints = computed(() => {
  return rawExpenseData.map((val, i) => ({
    x: (i / (rawExpenseData.length - 1)) * width,
    y: paddingY + (height - paddingY * 2) * (1 - val / 100),
    val: val
  }))
})

const expenseLinePath = computed(() => {
  const points = chartPoints.value
  if (!points || points.length < 2) return ''
  const first = points[0]
  if (!first) return ''
  
  let d = `M ${first.x} ${first.y}`
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i]
    const next = points[i + 1]
    if (curr && next) {
      const cp1x = curr.x + (next.x - curr.x) / 3
      const cp2x = next.x - (next.x - curr.x) / 3
      const cp1y = curr.y
      const cp2y = next.y
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`
    }
  }
  return d
})

const expenseAreaPath = computed(() => {
  const lineD = expenseLinePath.value
  if (!lineD) return ''
  const points = chartPoints.value
  const lastPoint = points?.[points.length - 1]
  const firstPoint = points?.[0]
  if (!lastPoint || !firstPoint) return ''
  return `${lineD} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`
})
</script>
