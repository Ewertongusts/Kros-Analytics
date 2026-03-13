<template>
  <div class="flex gap-8 border-b border-white/10">
    <button 
      @click="$emit('update:modelValue', 'todos')"
      :class="[
        'pb-3 text-[11px] font-bold uppercase tracking-widest transition-all relative',
        modelValue === 'todos' 
          ? 'text-kros-blue' 
          : 'text-white/50 hover:text-white'
      ]"
    >
      Todos
      <div v-if="modelValue === 'todos'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-kros-blue"></div>
    </button>
    <button 
      @click="$emit('update:modelValue', 'produto')"
      :class="[
        'pb-3 text-[11px] font-bold uppercase tracking-widest transition-all relative',
        modelValue === 'produto' 
          ? 'text-purple-400' 
          : 'text-white/50 hover:text-white'
      ]"
    >
      Produtos
      <div v-if="modelValue === 'produto'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"></div>
    </button>
    <button 
      @click="$emit('update:modelValue', 'servico')"
      :class="[
        'pb-3 text-[11px] font-bold uppercase tracking-widest transition-all relative',
        modelValue === 'servico' 
          ? 'text-blue-400' 
          : 'text-white/50 hover:text-white'
      ]"
    >
      Serviços
      <div v-if="modelValue === 'servico'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
    </button>
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
