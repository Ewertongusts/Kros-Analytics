<template>
  <div class="space-y-2">
    <label v-if="label" class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 pl-1">
      {{ label }} <span v-if="required" class="text-red-400">*</span>
    </label>
    <select 
      :value="modelValue"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      :required="required"
      :disabled="disabled"
      :class="[
        'w-full bg-[#111112] border rounded-xl px-4 py-2.5 text-xs text-white outline-none transition-all font-medium appearance-none',
        variant === 'primary' ? 'border-white/10 focus:border-kros-blue' :
        variant === 'success' ? 'border-emerald-500/30 focus:border-emerald-500' :
        variant === 'warning' ? 'border-orange-500/30 focus:border-orange-500' :
        variant === 'info' ? 'border-blue-500/30 focus:border-blue-500' :
        'border-white/10 focus:border-kros-blue',
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      ]"
    >
      <slot />
    </select>
    <p v-if="hint" class="text-[9px] text-white/40 pl-1">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label?: string
  required?: boolean
  disabled?: boolean
  hint?: string
  variant?: 'primary' | 'success' | 'warning' | 'info'
}>()

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>
