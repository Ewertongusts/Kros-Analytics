<template>
  <div class="space-y-2">
    <label class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">Observações</label>
    <textarea 
      :value="notes"
      @input="$emit('update:notes', ($event.target as HTMLTextAreaElement).value)"
      rows="2"
      placeholder="Detalhes adicionais..."
      class="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-2.5 text-xs text-white outline-none focus:border-kros-blue transition-all font-medium placeholder:text-white/20 resize-none"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  notes: string
}>()

defineEmits<{
  'update:notes': [value: string]
}>()
</script>
