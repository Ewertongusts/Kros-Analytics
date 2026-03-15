<template>
  <div class="space-y-3">
    <label class="block text-sm font-bold text-white">Estimativa de Tempo</label>
    
    <div class="flex items-center gap-2">
      <input
        v-model.number="hours"
        type="number"
        min="0"
        max="999"
        placeholder="0"
        class="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-white/20"
      />
      <span class="text-white/70 text-sm">horas</span>
      <button
        @click="saveEstimation"
        :disabled="!hasChanged"
        class="ml-auto px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm font-bold transition-all"
      >
        Salvar
      </button>
    </div>

    <div v-if="estimatedTime" class="text-xs text-white/50">
      Tempo estimado: {{ estimatedTime }} horas
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  initialValue?: number
}>()

const emit = defineEmits(['save'])

const hours = ref(props.initialValue || 0)
const estimatedTime = ref(props.initialValue || 0)

const hasChanged = computed(() => hours.value !== estimatedTime.value)

const saveEstimation = () => {
  estimatedTime.value = hours.value
  emit('save', hours.value)
}
</script>
