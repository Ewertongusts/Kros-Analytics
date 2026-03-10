<template>
  <div class="p-6 rounded-2xl bg-kros-surface dark:bg-[#111112] border border-kros-outline dark:border-[#1F1F21] group hover:border-kros-blue/10 transition-all">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h3 class="font-bold text-lg text-kros-text dark:text-kros-surface">Crescimento de Receita (MRR)</h3>
        <p class="text-xs text-kros-text/60 dark:text-white/60 tracking-wide mt-1 uppercase">Evolução Mensal da Receita Recurrente</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-kros-blue"></span>
          <span class="text-[10px] font-bold opacity-80 text-white uppercase tracking-tighter">Receita Ativa</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/30"></span>
          <span class="text-[10px] font-bold opacity-80 text-white uppercase tracking-tighter">Projeção Meta</span>
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
             class="absolute top-0 bottom-0 w-px bg-kros-blue/30 z-0 pointer-events-none"
             :style="{ left: (hoveredPoint.x / 10) + '%' }">
        </div>

        <!-- Tooltip Flutuante -->
        <div v-if="hoveredPoint" 
             class="absolute z-30 pointer-events-none transition-all duration-200"
             :style="{ left: (hoveredPoint.x / 10) + '%', top: ((hoveredPoint.y / 300) * 100) - 15 + '%', transform: 'translateX(-50%)' }">
            <div class="bg-kros-text dark:bg-white text-kros-main dark:text-kros-text px-4 py-2.5 rounded-xl shadow-2xl text-[10px] whitespace-nowrap border border-white/10 min-w-[140px]">
               <div class="font-black text-[11px] mb-2 border-b border-kros-main/10 dark:border-kros-text/5 pb-1 opacity-60 uppercase tracking-widest">
                  {{ months[hoveredPoint.idx] }} 2026
               </div>
               <div class="space-y-1.5">
                  <div class="flex items-center justify-between gap-4">
                     <div class="flex items-center gap-1.5 opacity-70 font-bold">
                        <span class="w-1.5 h-1.5 rounded-full bg-kros-blue"></span>
                        Receita:
                     </div>
                     <span class="font-black text-[11px] tracking-tighter text-blue-500 font-bold">{{ formatCurrency(1000 + hoveredPoint.val * 150) }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-4 pt-1">
                     <div class="flex items-center gap-1.5 opacity-70 font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/></svg>
                        Novos Clientes:
                     </div>
                     <span class="font-black text-[11px] tracking-tighter text-emerald-500">+{{ hoveredPoint.clients }}</span>
                  </div>
                  <div v-if="hoveredPoint.churn > 0" class="flex items-center justify-between gap-4 border-t border-kros-main/5 dark:border-kros-text/5 pt-1.5 mt-1">
                     <div class="flex items-center gap-1.5 opacity-70 font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-red-500"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 11h-6"/></svg>
                        Churn (Perda):
                     </div>
                     <span class="font-black text-[11px] tracking-tighter text-red-500">-{{ hoveredPoint.churn }}</span>
                  </div>
               </div>
            </div>
        </div>

        <!-- SVG do Gráfico de Linhas -->
        <svg class="w-full h-full relative z-10 overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
           <defs>
             <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stop-color="#007BFF" stop-opacity="0.35" />
               <stop offset="60%" stop-color="#007BFF" stop-opacity="0.1" />
               <stop offset="100%" stop-color="#007BFF" stop-opacity="0" />
             </linearGradient>
           </defs>
           
           <!-- Área preenchida -->
           <path 
              :d="mrrAreaPath" 
              fill="url(#chartFill)" 
              class="transition-all duration-1000 ease-out"
           />
           
           <!-- Linha de meta -->
           <path 
              d="M 0 100 L 1000 50" 
              fill="none" 
              stroke="#10B981" 
              stroke-width="2" 
              stroke-dasharray="8,4" 
              opacity="0.2"
           />

           <!-- Linha principal com curva -->
           <path 
              :d="mrrLinePath" 
              fill="none" 
              stroke="#007BFF" 
              stroke-width="4" 
              stroke-linecap="round" 
              stroke-linejoin="round"
              class="transition-all duration-1000 ease-out shadow-lg"
           />

           <!-- Pontos Interativos (Markers) -->
           <g v-for="(p, idx) in chartPoints" :key="idx" 
              @mouseenter="hoveredPoint = { ...p, idx }" 
              @mouseleave="hoveredPoint = null"
              class="group/point">
              <circle 
                 :cx="p.x" 
                 :cy="p.y" 
                 r="6" 
                 fill="#007BFF" 
                 :class="['transition-all duration-200 cursor-pointer', hoveredPoint?.idx === idx ? 'opacity-100 r-8 scale-150' : 'opacity-0 group-hover/point:opacity-100']"
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

// Estado de Interatividade
const hoveredPoint = ref<any>(null)
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// Lógica do Gráfico de Linhas Clean
const rawData = [
  { val: 35, clients: 12, churn: 0 }, { val: 52, clients: 18, churn: 0 }, { val: 45, clients: 15, churn: 5 },
  { val: 68, clients: 22, churn: 0 }, { val: 62, clients: 19, churn: 4 }, { val: 82, clients: 28, churn: 0 },
  { val: 88, clients: 31, churn: 0 }, { val: 78, clients: 24, churn: 7 }, { val: 92, clients: 35, churn: 0 },
  { val: 98, clients: 38, churn: 0 }, { val: 85, clients: 30, churn: 6 }, { val: 100, clients: 42, churn: 0 }
]
const width = 1000
const height = 300
const paddingY = 50 

const chartPoints = computed(() => {
  return rawData.map((item, i) => ({
    x: (i / (rawData.length - 1)) * width,
    y: paddingY + (height - paddingY * 1.5) * (1 - item.val / 100),
    val: item.val,
    clients: item.clients,
    churn: item.churn
  }))
})

// Gerar path com curva (Cubic Bézier)
const mrrLinePath = computed(() => {
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

const mrrAreaPath = computed(() => {
  const lineD = mrrLinePath.value
  if (!lineD) return ''
  const points = chartPoints.value
  const lastPoint = points?.[points.length - 1]
  const firstPoint = points?.[0]
  if (!lastPoint || !firstPoint) return ''
  return `${lineD} L ${lastPoint.x} ${height} L ${firstPoint.x} ${height} Z`
})
</script>
