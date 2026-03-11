<template>
  <div class="flex items-center gap-1.5 bg-black/20 p-1.5 rounded-xl border border-white/5 shadow-inner">
    <button 
      v-for="option in options" 
      :key="option.id"
      @click="updateModelValue(option.id)"
      :class="[
        'px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all duration-300',
        modelValue === option.id 
          ? 'btn-primary' 
          : 'text-white/40 hover:text-white/80 hover:bg-white/5'
      ]"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  options: { id: string, label: string }[]
}>()

const emit = defineEmits(['update:modelValue'])

const updateModelValue = (id: string) => {
  emit('update:modelValue', id)
}
</script>
