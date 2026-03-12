<template>
  <div class="p-8 rounded-3xl bg-white/[0.02] border border-white/10 flex flex-col gap-8 h-full">
    <div>
      <h4 class="text-xs font-bold text-white uppercase tracking-widest">Testar Envio Manual</h4>
      <p class="text-[9px] text-white/40 uppercase tracking-widest mt-1">Validação instantânea de conectividade</p>
    </div>

    <div class="space-y-5">
      <div class="space-y-2">
        <label class="text-[9px] font-bold text-white/30 uppercase tracking-widest pl-1">Número de Destino</label>
        <input 
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="5581900000000"
          class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white outline-none focus:border-kros-blue transition-all"
        />
      </div>

      <button 
        @click="$emit('test')"
        :disabled="testing || !apiUrl"
        class="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <div v-if="testing" class="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        {{ testing ? 'ENVIANDO...' : 'TESTAR AGORA' }}
      </button>
    </div>

    <!-- Last Result -->
    <div v-if="lastTestAt" class="pt-6 border-t border-white/5 mt-auto">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">Último Verificado</span>
        <span class="text-[9px] font-black text-white/60 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">{{ formatDate(lastTestAt) }}</span>
      </div>
      <div :class="[
        'p-3.5 rounded-2xl flex items-center gap-3 transition-all duration-500',
        lastTestStatus === 'success' 
          ? 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
          : 'bg-red-500/5 border border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.05)]'
      ]">
        <div :class="['w-8 h-8 rounded-full flex items-center justify-center shrink-0 border', lastTestStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20']">
          <svg v-if="lastTestStatus === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5">{{ lastTestStatus === 'success' ? 'Conexão Estável' : 'Conexão Interrompida' }}</p>
          <p class="text-[11px] font-medium leading-tight truncate">{{ lastTestResponse }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  testing: boolean
  apiUrl: string
  lastTestAt?: string
  lastTestStatus?: string
  lastTestResponse?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
  test: []
}>()

const formatDate = (dateValue: string) => {
  const d = new Date(dateValue)
  return d.toLocaleString('pt-BR', { 
    day: '2-digit', month: '2-digit', 
    hour: '2-digit', minute: '2-digit'
  }) + 'h'
}
</script>
