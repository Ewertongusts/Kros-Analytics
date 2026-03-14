<template>
  <UiKModal :is-open="isOpen" @close="$emit('close')" size="sm">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-5">
        <div class="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
          <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">Estornar Pagamento</h3>
          <p class="text-sm text-gray-400">Esta ação pode ser revertida</p>
        </div>
      </div>

      <!-- Content -->
      <div class="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
        <p class="text-gray-400 text-sm mb-2">
          Deseja estornar o pagamento de
        </p>
        <p class="text-white font-semibold text-xl">
          {{ companyName }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          @click="$emit('close')"
          class="flex-1 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors text-sm font-medium border border-gray-600/50"
        >
          Cancelar
        </button>
        <button
          @click="$emit('confirm')"
          class="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition-all text-sm font-semibold shadow-lg shadow-yellow-500/20"
        >
          Confirmar Estorno
        </button>
      </div>
    </div>
  </UiKModal>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  companyName: string
}>()

defineEmits<{
  close: []
  confirm: []
}>()
</script>
