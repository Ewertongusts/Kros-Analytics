<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="close"
        ></div>

        <!-- Modal -->
        <div class="relative bg-[#1a1a1c] border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-white/5">
            <h2 class="text-base font-semibold text-white">Renomear Coluna</h2>
            <p class="text-xs text-white/40 mt-1">{{ column?.name }}</p>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-5">
            <!-- Input -->
            <div>
              <label class="block text-xs font-medium text-white/60 mb-2.5 uppercase tracking-wide">Novo nome</label>
              <input
                v-model="newName"
                type="text"
                placeholder="Digite o novo nome..."
                class="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
                @keyup.enter="submit"
                @keyup.escape="close"
                autofocus
              />
            </div>

            <!-- Color picker -->
            <div>
              <label class="block text-xs font-medium text-white/60 mb-3 uppercase tracking-wide">Cor</label>
              <div class="flex gap-2.5">
                <button
                  v-for="color in colors"
                  :key="color"
                  @click="selectedColor = color"
                  :style="{ backgroundColor: color }"
                  :class="[
                    'w-7 h-7 rounded-md transition-all flex-shrink-0',
                    selectedColor === color ? 'ring-2 ring-white/40 scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'
                  ]"
                ></button>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-white/[0.02] border-t border-white/5 px-6 py-4 flex gap-2.5 justify-end">
            <button
              @click="close"
              class="px-4 py-2 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/5 transition-all text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              @click="submit"
              :disabled="!newName.trim()"
              class="px-5 py-2 text-white rounded-lg transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              :style="{ backgroundColor: 'var(--kros-blue, #3b82f6)' }"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Column {
  column_id: string
  name: string
  color: string
  status: string
  position: number
}

const props = defineProps<{
  isOpen: boolean
  column: Column | null
}>()

const emit = defineEmits<{
  close: []
  save: [name: string, color: string]
}>()

const newName = ref('')
const selectedColor = ref('#8b5cf6')

const colors = [
  '#8b5cf6', // purple
  '#3b82f6', // blue
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#6366f1', // indigo
]

watch(() => props.isOpen, (val) => {
  if (val && props.column) {
    newName.value = props.column.name
    selectedColor.value = props.column.color
  }
})

const close = () => {
  emit('close')
}

const submit = () => {
  if (newName.value.trim()) {
    emit('save', newName.value.trim(), selectedColor.value)
    close()
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div:nth-child(2) {
  animation: slideUp 0.3s ease;
}

.modal-leave-active > div:nth-child(2) {
  animation: slideDown 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(20px);
    opacity: 0;
  }
}
</style>
