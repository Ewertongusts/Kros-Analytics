<template>
  <div class="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 relative">
    <div 
      v-for="option in options" 
      :key="option.id"
      class="group/filter relative"
    >
      <button 
        @click="updateModelValue(option.id)"
        :class="[
          'px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 whitespace-nowrap',
          modelValue === option.id 
            ? 'btn-primary text-white scale-105 z-10' 
            : 'text-white/30 hover:text-white/70 hover:bg-white/5'
        ]"
      >
        {{ option.label }}
      </button>

      <!-- Explicação (Tooltip) -->
      <div v-if="option.description" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-black border border-white/10 rounded-xl opacity-0 group-hover/filter:opacity-100 transition-all pointer-events-none z-[200] w-max max-w-[200px] shadow-2xl">
         <p class="text-[9px] font-black text-kros-blue uppercase tracking-widest mb-1">{{ option.label }}</p>
         <p class="text-[10px] text-white/60 leading-tight font-medium">{{ option.description }}</p>
         <!-- Arrow -->
         <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-black"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
  options: { id: string, label: string, description?: string }[]
}>()

const emit = defineEmits(['update:modelValue'])

const updateModelValue = (id: string) => {
  emit('update:modelValue', id)
}
</script>
