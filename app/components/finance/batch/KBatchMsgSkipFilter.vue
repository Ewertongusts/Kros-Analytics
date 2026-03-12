<template>
  <div :class="['rounded-xl border transition-all duration-300', modelValue ? 'bg-amber-500/5 border-amber-500/15' : 'bg-white/[0.02] border-white/5']">
    <!-- Top Row -->
    <div class="flex items-center justify-between p-4">
      <div class="flex items-center gap-3">
        <!-- Icon -->
        <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors', modelValue ? 'bg-amber-500/10' : 'bg-white/5']">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="modelValue ? '#f59e0b' : 'rgba(255,255,255,0.2)'" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <!-- Title + subtitle -->
        <div>
          <p :class="['text-[11px] font-black uppercase tracking-widest leading-none', modelValue ? 'text-amber-400' : 'text-white/40']">Pular Recentes</p>
          <p class="text-[9px] text-white/20 font-medium mt-0.5">Proteção anti-spam de envio</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-3">
        <Transition name="slide-x">
          <div v-if="modelValue" class="flex items-center gap-1.5 bg-black/50 pl-3 pr-2 py-1.5 rounded-lg border border-amber-500/20">
            <input
              :value="days"
              @input="$emit('update:days', Number(($event.target as HTMLInputElement).value))"
              type="number"
              min="1"
              class="w-8 bg-transparent text-xs font-black text-amber-400 outline-none text-center"
            >
            <span class="text-[9px] font-bold text-amber-500/50 uppercase">dias</span>
          </div>
        </Transition>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            :checked="modelValue"
            @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
            class="sr-only peer"
          >
          <div class="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/30 peer-checked:after:bg-amber-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500/20 border border-white/5 peer-checked:border-amber-500/30"></div>
        </label>
      </div>
    </div>

    <!-- Description Bar -->
    <div class="px-4 pb-4">
      <div :class="['rounded-lg px-3 py-2 text-[10px] leading-relaxed border', modelValue ? 'bg-amber-500/5 border-amber-500/10 text-amber-200/60' : 'bg-white/[0.02] border-white/5 text-white/20']">
        <template v-if="modelValue">
          Contatos que receberam cobrança nos últimos
          <strong class="text-amber-400">{{ days }} {{ days === 1 ? 'dia' : 'dias' }}</strong>
          serão pulados. Altere o número de dias conforme sua política de cobrança.
        </template>
        <template v-else>
          <strong class="text-white/30">Filtro inativo.</strong>
          Todos os contatos receberão mensagem independente de cobranças anteriores.
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  days: number
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
  'update:days': [value: number]
}>()
</script>
