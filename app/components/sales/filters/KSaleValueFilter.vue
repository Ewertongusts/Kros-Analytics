<template>
  <div class="flex flex-col gap-2">
    <label class="text-[10px] font-bold uppercase tracking-widest text-white/60">
      Faixa de Valor
    </label>
    <div class="flex gap-2 items-center">
      <div class="flex-1">
        <input 
          :value="minValue"
          @input="handleMinInput"
          type="number"
          step="0.01"
          min="0"
          placeholder="Mínimo"
          class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:border-kros-blue focus:outline-none transition-all"
        />
      </div>
      <span class="text-white/30">até</span>
      <div class="flex-1">
        <input 
          :value="maxValue"
          @input="handleMaxInput"
          type="number"
          step="0.01"
          min="0"
          placeholder="Máximo"
          class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:border-kros-blue focus:outline-none transition-all"
        />
      </div>
    </div>
    <button 
      v-if="minValue || maxValue"
      @click="clearValues"
      class="text-[10px] text-white/40 hover:text-white transition-colors self-start"
    >
      Limpar valores
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  minValue: number | null
  maxValue: number | null
}>()

const emit = defineEmits(['update:minValue', 'update:maxValue'])

const handleMinInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:minValue', value ? parseFloat(value) : null)
}

const handleMaxInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:maxValue', value ? parseFloat(value) : null)
}

const clearValues = () => {
  emit('update:minValue', null)
  emit('update:maxValue', null)
}
</script>
