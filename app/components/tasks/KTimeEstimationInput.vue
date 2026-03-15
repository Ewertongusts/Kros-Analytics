<template>
  <div class="space-y-2">
    <label class="block text-xs font-bold uppercase tracking-widest text-white/50 mb-1.5">⏱️ Estimativa de Tempo</label>
    
    <div class="flex gap-2">
      <!-- Input de Valor -->
      <div class="flex-1">
        <input 
          v-model.number="value"
          type="number"
          step="0.5"
          min="0"
          placeholder="Ex: 2.5"
          class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:border-blue-500 focus:outline-none transition-all"
        />
      </div>

      <!-- Seletor de Unidade -->
      <div class="w-24">
        <select 
          v-model="unit"
          class="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-blue-500 focus:outline-none transition-all"
        >
          <option value="hours">Horas</option>
          <option value="days">Dias</option>
        </select>
      </div>
    </div>

    <!-- Conversão Exibida -->
    <div v-if="value && value > 0" class="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
      <div class="text-xs text-blue-300 space-y-1">
        <div v-if="unit === 'hours'" class="flex items-center justify-between">
          <span>{{ value }}h =</span>
          <span class="font-bold">{{ convertedValue.toFixed(2) }}d</span>
        </div>
        <div v-else class="flex items-center justify-between">
          <span>{{ value }}d =</span>
          <span class="font-bold">{{ convertedValue.toFixed(1) }}h</span>
        </div>
      </div>
    </div>

    <!-- Sugestões Rápidas -->
    <div class="flex gap-1 flex-wrap">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion.label"
        @click="selectSuggestion(suggestion)"
        class="px-2 py-1 text-xs font-bold bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all"
      >
        {{ suggestion.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useTimeEstimation } from '~/composables/useTimeEstimation'

interface Props {
  modelValue?: {
    estimated_hours?: number
    estimated_days?: number
    time_unit: 'hours' | 'days'
  }
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ time_unit: 'hours' })
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const { hoursToDays, daysToHours } = useTimeEstimation()

const value = ref<number | null>(null)
const unit = ref<'hours' | 'days'>('hours')

const suggestions = [
  { label: '30min', value: 0.5, unit: 'hours' },
  { label: '1h', value: 1, unit: 'hours' },
  { label: '2h', value: 2, unit: 'hours' },
  { label: '4h', value: 4, unit: 'hours' },
  { label: '1d', value: 1, unit: 'days' },
  { label: '2d', value: 2, unit: 'days' },
  { label: '1w', value: 5, unit: 'days' }
]

const convertedValue = computed(() => {
  if (!value.value || value.value <= 0) return 0

  if (unit.value === 'hours') {
    return hoursToDays(value.value)
  } else {
    return daysToHours(value.value)
  }
})

const selectSuggestion = (suggestion: any) => {
  value.value = suggestion.value
  unit.value = suggestion.unit
}

watch([value, unit], () => {
  if (value.value && value.value > 0) {
    emit('update:modelValue', {
      estimated_hours: unit.value === 'hours' ? value.value : daysToHours(value.value),
      estimated_days: unit.value === 'days' ? value.value : hoursToDays(value.value),
      time_unit: unit.value
    })
  } else {
    emit('update:modelValue', {
      estimated_hours: undefined,
      estimated_days: undefined,
      time_unit: unit.value
    })
  }
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    unit.value = newValue.time_unit || 'hours'
    if (newValue.time_unit === 'hours' && newValue.estimated_hours) {
      value.value = newValue.estimated_hours
    } else if (newValue.time_unit === 'days' && newValue.estimated_days) {
      value.value = newValue.estimated_days
    }
  }
}, { immediate: true })
</script>
