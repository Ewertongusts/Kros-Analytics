<template>
  <div class="space-y-2">
    <label class="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1">Editor de Mensagem</label>
    <textarea 
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      rows="4"
      placeholder="Selecione um modelo acima..."
      class="w-full rounded-xl p-4 text-[13px] leading-relaxed font-medium outline-none transition-all resize-none focus:ring-1 focus:ring-kros-blue/40"
      style="background:#141416; color: rgba(255,255,255,0.9); border: 1px solid rgba(255,255,255,0.07); caret-color: white;"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
