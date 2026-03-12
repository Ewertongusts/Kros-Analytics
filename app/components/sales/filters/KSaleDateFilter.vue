<template>
  <div class="flex flex-col gap-2">
    <label class="text-[10px] font-bold uppercase tracking-widest text-white/60">
      Período
    </label>
    <div class="flex gap-2">
      <input 
        :value="startDate"
        @input="$emit('update:startDate', ($event.target as HTMLInputElement).value)"
        type="date"
        class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-kros-blue focus:outline-none transition-all"
      />
      <span class="text-white/30 self-center">até</span>
      <input 
        :value="endDate"
        @input="$emit('update:endDate', ($event.target as HTMLInputElement).value)"
        type="date"
        class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:border-kros-blue focus:outline-none transition-all"
      />
    </div>
    <button 
      v-if="startDate || endDate"
      @click="clearDates"
      class="text-[10px] text-white/40 hover:text-white transition-colors self-start"
    >
      Limpar período
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  startDate: string
  endDate: string
}>()

const emit = defineEmits(['update:startDate', 'update:endDate'])

const clearDates = () => {
  emit('update:startDate', '')
  emit('update:endDate', '')
}
</script>
