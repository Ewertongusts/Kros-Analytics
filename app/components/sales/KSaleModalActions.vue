<template>
  <div class="flex gap-3 pt-4 border-t border-white/10 mt-4">
    <button 
      type="button"
      @click="$emit('cancel')"
      class="flex-1 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
    >
      Cancelar
    </button>
    <button 
      type="submit"
      :disabled="!isValid"
      class="flex-1 btn-primary py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      SALVAR VENDA
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isValid: boolean
}>()

defineEmits<{
  cancel: []
}>()
</script>
