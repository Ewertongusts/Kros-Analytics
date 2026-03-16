<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
      @click.self="close"
    >
      <div class="bg-[#0f0f11] border border-white/5 rounded-xl p-5 w-full max-w-xs shadow-2xl">
        <!-- Header -->
        <div class="text-center mb-5">
          <h2 class="text-lg font-bold text-white uppercase tracking-wider">Nova Coluna</h2>
          <div class="w-12 h-0.5 bg-gradient-to-r from-transparent via-kros-blue to-transparent mx-auto mt-2"></div>
        </div>

        <!-- Form -->
        <div class="space-y-4 mb-5">
          <!-- Nome -->
          <div>
            <label class="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">Nome</label>
            <input
              v-model="columnName"
              type="text"
              placeholder="Ex: Em Progresso"
              class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-kros-blue focus:ring-1 focus:ring-kros-blue/50 focus:bg-white/8 transition-all"
              @keyup.enter="submit"
            />
          </div>

          <!-- Cor -->
          <div>
            <label class="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">Cor</label>
            <div class="flex gap-2">
              <button
                v-for="c in colors"
                :key="c"
                @click="selectedColor = c"
                :style="{ backgroundColor: c }"
                :class="[
                  'w-8 h-8 rounded-md transition-all',
                  selectedColor === c ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0f0f11] scale-105' : 'hover:scale-105 opacity-60 hover:opacity-100'
                ]"
              />
            </div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-2">
          <button
            @click="close"
            class="flex-1 px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/70 hover:border-white/15 transition-all text-xs font-semibold uppercase tracking-wide"
          >
            Cancelar
          </button>
          <button
            @click="submit"
            :disabled="!columnName.trim()"
            class="flex-1 px-3 py-2 rounded-lg bg-kros-blue hover:bg-kros-blue/90 disabled:bg-kros-blue/40 disabled:cursor-not-allowed text-white transition-all text-xs font-bold uppercase tracking-wide"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'create', name: string, color: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const columnName = ref('')
const selectedColor = ref('#8b5cf6')
const colors = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#ef4444']

const submit = () => {
  if (!columnName.value.trim()) return
  emit('create', columnName.value, selectedColor.value)
  columnName.value = ''
  selectedColor.value = '#8b5cf6'
}

const close = () => {
  columnName.value = ''
  selectedColor.value = '#8b5cf6'
  emit('close')
}
</script>
