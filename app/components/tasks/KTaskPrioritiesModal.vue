<template>
  <UiKModal :is-open="isOpen" size="md" @close="$emit('close')">
    <UiKModalHeader title="⭐ Customizar Prioridades" />

    <div class="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
      <div v-for="priority in priorities" :key="priority.id" class="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-white uppercase tracking-widest">{{ priority.label }}</h3>
          <div class="flex items-center gap-2">
            <div
              class="w-8 h-8 rounded-lg border-2 border-white/20 cursor-pointer hover:border-white/40 transition-all"
              :style="{ backgroundColor: priority.color }"
              @click="openColorPicker(priority.id)"
              title="Clique para mudar cor"
            />
            <input
              type="color"
              :value="priority.color"
              @change="(e) => updateColor(priority.id, (e.target as HTMLInputElement).value)"
              class="w-0 h-0 opacity-0"
              :ref="`colorInput_${priority.id}`"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Label</label>
            <input
              :value="priority.label"
              @change="(e) => updateLabel(priority.id, (e.target as HTMLInputElement).value)"
              type="text"
              class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-white/20 focus:outline-none transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-white/50 uppercase tracking-widest mb-1">Ordem</label>
            <input
              :value="priority.order"
              @change="(e) => updateOrder(priority.id, parseInt((e.target as HTMLInputElement).value))"
              type="number"
              min="1"
              class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:border-white/20 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div class="p-3 rounded-lg" :style="{ backgroundColor: priority.color + '20' }">
          <p class="text-xs font-semibold" :style="{ color: priority.color }">Preview: {{ priority.label }}</p>
        </div>
      </div>
    </div>

    <UiKModalActions
      cancel-text="Fechar"
      :show-confirm="false"
      @cancel="$emit('close')"
    />
  </UiKModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTaskPriorities } from '~/composables/useTaskPriorities'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close'])

const { priorities, updatePriority } = useTaskPriorities()

const openColorPicker = (priorityId: string) => {
  const input = document.querySelector(`input[type="color"][data-priority="${priorityId}"]`) as HTMLInputElement
  if (input) input.click()
}

const updateColor = async (priorityId: string, color: string) => {
  await updatePriority(priorityId, { color })
}

const updateLabel = async (priorityId: string, label: string) => {
  await updatePriority(priorityId, { label })
}

const updateOrder = async (priorityId: string, order: number) => {
  await updatePriority(priorityId, { order })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
