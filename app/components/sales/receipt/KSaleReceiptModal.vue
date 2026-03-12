<template>
  <UiKModal :is-open="isOpen" size="sm" @close="$emit('close')">
    <template #header>
      <UiKModalHeader 
        title="Gerar Comprovante"
        subtitle="Escolha o formato de exportação"
        @close="$emit('close')"
      />
    </template>

    <div class="p-6 space-y-3">
      <button 
        @click="$emit('export', 'image')"
        class="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500 transition-all group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <circle cx="9" cy="9" r="2"/>
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        </svg>
        <div class="flex-1 text-left">
          <p class="text-sm font-bold text-white group-hover:text-blue-500 transition-colors">Exportar como Imagem</p>
          <p class="text-xs text-white/40 mt-1">Formato PNG de alta qualidade</p>
        </div>
      </button>

      <button 
        @click="$emit('export', 'pdf')"
        class="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500 transition-all group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <div class="flex-1 text-left">
          <p class="text-sm font-bold text-white group-hover:text-red-500 transition-colors">Exportar como PDF</p>
          <p class="text-xs text-white/40 mt-1">Documento portátil universal</p>
        </div>
      </button>
    </div>
  </UiKModal>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
}>()

defineEmits(['close', 'export'])
</script>
