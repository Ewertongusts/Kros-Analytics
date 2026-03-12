<template>
  <div class="flex gap-2 flex-wrap">
    <button 
      @click="$emit('update:modelValue', 'todos')"
      :class="[
        'px-4 py-2.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest',
        modelValue === 'todos' 
          ? 'bg-kros-blue border-kros-blue text-white' 
          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
      ]"
    >
      Todos
    </button>
    <button 
      @click="$emit('update:modelValue', 'produto')"
      :class="[
        'px-4 py-2.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest',
        modelValue === 'produto' 
          ? 'bg-purple-500 border-purple-500 text-white' 
          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
      ]"
    >
      📦 Produtos
    </button>
    <button 
      @click="$emit('update:modelValue', 'servico')"
      :class="[
        'px-4 py-2.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest',
        modelValue === 'servico' 
          ? 'bg-blue-500 border-blue-500 text-white' 
          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
      ]"
    >
      🛠️ Serviços
    </button>
    <button 
      @click="$emit('update:modelValue', 'personalizado')"
      :class="[
        'px-4 py-2.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-widest',
        modelValue === 'personalizado' 
          ? 'bg-orange-500 border-orange-500 text-white' 
          : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
      ]"
    >
      ✨ Personalizados
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
