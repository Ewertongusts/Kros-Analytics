<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
      @click.self="handleCancel"
    >
      <div class="bg-[#0f0f11] border border-white/5 rounded-xl p-5 w-full max-w-xs shadow-2xl">
        <!-- Header -->
        <div class="text-center mb-5">
          <div class="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 class="text-sm font-bold text-white uppercase tracking-wider">Confirmar Exclusão</h2>
        </div>

        <!-- Message -->
        <p class="text-sm text-white/60 text-center mb-5">{{ message }}</p>

        <!-- Buttons -->
        <div class="flex gap-2">
          <button
            @click="handleCancel"
            class="flex-1 px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white/70 hover:border-white/15 transition-all text-xs font-semibold uppercase tracking-wide"
          >
            Cancelar
          </button>
          <button
            @click="handleConfirm"
            class="flex-1 px-3 py-2 rounded-lg bg-kros-blue hover:bg-kros-blue/90 text-white transition-all text-xs font-bold uppercase tracking-wide"
          >
            Deletar
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
  message: string
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>
