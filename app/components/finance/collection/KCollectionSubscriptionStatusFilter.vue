<template>
  <div class="relative group/filter shrink-0">
    <button 
      @click="isOpen = !isOpen"
      :class="[
        'flex items-center gap-4 px-5 py-3 rounded-xl border transition-all',
        hasActiveFilters 
          ? 'bg-kros-blue/10 border-kros-blue/30 text-white hover:bg-kros-blue/20' 
          : 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10 text-white/70 hover:text-white'
      ]"
    >
      <div class="flex flex-col items-start leading-none gap-1">
        <span class="text-[8px] font-black uppercase tracking-[0.2em] text-white/30">
          {{ hasActiveFilters ? 'Status Assinatura' : 'Status Assinatura' }}
        </span>
        <span class="text-[11px] font-bold uppercase tracking-widest text-white">
          {{ hasActiveFilters ? `${selectedStatuses.length} selecionado${selectedStatuses.length > 1 ? 's' : ''}` : 'Todos' }}
        </span>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="['transition-transform', isOpen ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
    </button>

    <div 
      v-if="isOpen" 
      class="absolute top-full right-0 mt-3 w-72 bg-[#161618] border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-[200] p-3 animate-in fade-in zoom-in-95 duration-200"
    >
      <div class="space-y-2">
        <div class="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
          <span class="text-[9px] font-black uppercase tracking-[0.2em] text-white/50">Filtrar por Status</span>
          <button 
            v-if="hasActiveFilters"
            @click="$emit('clear')"
            class="text-[8px] font-bold uppercase tracking-wider text-kros-blue hover:text-kros-blue/80 transition-colors"
          >
            Limpar
          </button>
        </div>

        <button 
          v-for="status in statusOptions" 
          :key="status.value"
          @click="$emit('toggle', status.value)"
          :class="[
            'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all group/opt',
            selectedStatuses.includes(status.value) 
              ? 'bg-kros-blue/10 border border-kros-blue/30' 
              : 'hover:bg-white/5 border border-transparent'
          ]"
        >
          <div class="flex items-center gap-3">
            <div 
              :class="[
                'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                selectedStatuses.includes(status.value)
                  ? 'bg-kros-blue border-kros-blue'
                  : 'border-white/20 group-hover/opt:border-white/40'
              ]"
            >
              <svg 
                v-if="selectedStatuses.includes(status.value)" 
                xmlns="http://www.w3.org/2000/svg" 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="4" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                class="text-white"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            
            <div class="flex flex-col items-start">
              <span :class="['text-[10px] font-bold uppercase tracking-widest transition-colors', selectedStatuses.includes(status.value) ? 'text-white' : 'text-white/70 group-hover/opt:text-white']">
                {{ status.label }}
              </span>
              <span :class="['text-[8px] font-bold uppercase tracking-tight mt-0.5 transition-colors', selectedStatuses.includes(status.value) ? 'text-white/60' : 'text-white/30 group-hover/opt:text-white/40']">
                {{ status.description }}
              </span>
            </div>
          </div>
          
          <span 
            :class="[
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase',
              status.color
            ]"
          >
            <component :is="status.icon" />
            {{ status.badge }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'

const props = defineProps<{
  selectedStatuses: string[]
}>()

defineEmits(['toggle', 'clear'])

const isOpen = ref(false)

const hasActiveFilters = computed(() => props.selectedStatuses.length > 0)

const statusOptions = [
  {
    value: 'active',
    label: 'Ativa',
    description: 'Contrato ativo',
    badge: 'Ativa',
    color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    icon: () => h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      width: '8', 
      height: '8', 
      viewBox: '0 0 24 24', 
      fill: 'none', 
      stroke: 'currentColor', 
      'stroke-width': '3', 
      'stroke-linecap': 'round', 
      'stroke-linejoin': 'round' 
    }, [
      h('polyline', { points: '20 6 9 17 4 12' })
    ])
  },
  {
    value: 'suspended',
    label: 'Suspensa',
    description: 'Temporariamente pausada',
    badge: 'Suspensa',
    color: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    icon: () => h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      width: '8', 
      height: '8', 
      viewBox: '0 0 24 24', 
      fill: 'none', 
      stroke: 'currentColor', 
      'stroke-width': '3', 
      'stroke-linecap': 'round', 
      'stroke-linejoin': 'round' 
    }, [
      h('rect', { x: '6', y: '4', width: '4', height: '16' }),
      h('rect', { x: '14', y: '4', width: '4', height: '16' })
    ])
  },
  {
    value: 'cancelled',
    label: 'Cancelada',
    description: 'Contrato encerrado',
    badge: 'Cancelada',
    color: 'bg-red-500/10 text-red-500 border border-red-500/20',
    icon: () => h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      width: '8', 
      height: '8', 
      viewBox: '0 0 24 24', 
      fill: 'none', 
      stroke: 'currentColor', 
      'stroke-width': '3', 
      'stroke-linecap': 'round', 
      'stroke-linejoin': 'round' 
    }, [
      h('line', { x1: '18', y1: '6', x2: '6', y2: '18' }),
      h('line', { x1: '6', y1: '6', x2: '18', y2: '18' })
    ])
  },
  {
    value: 'trial',
    label: 'Trial',
    description: 'Período de teste',
    badge: 'Trial',
    color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    icon: () => h('svg', { 
      xmlns: 'http://www.w3.org/2000/svg', 
      width: '8', 
      height: '8', 
      viewBox: '0 0 24 24', 
      fill: 'none', 
      stroke: 'currentColor', 
      'stroke-width': '3', 
      'stroke-linecap': 'round', 
      'stroke-linejoin': 'round' 
    }, [
      h('polygon', { points: '13 2 3 14 12 14 11 22 21 10 12 10 13 2' })
    ])
  }
]
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
