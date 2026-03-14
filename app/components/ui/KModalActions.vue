<template>
  <div class="flex gap-3 mt-6">
    <button 
      type="button"
      @click="$emit('cancel')"
      class="flex-1 py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
    >
      {{ cancelText }}
    </button>
    <button 
      :type="submitType"
      :disabled="disabled || loading"
      @click="handleClick"
      class="flex-1 btn-primary py-3.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <svg 
        v-if="loading"
        class="animate-spin"
        xmlns="http://www.w3.org/2000/svg" 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      {{ loading ? loadingText : confirmText }}
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  cancelText?: string
  confirmText?: string
  loadingText?: string
  disabled?: boolean
  loading?: boolean
  submitType?: 'submit' | 'button'
}>()

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()

const handleClick = () => {
  console.log('🔘 [KModalActions] Button clicked, submitType:', props.submitType)
  if (props.submitType === 'button') {
    console.log('📤 [KModalActions] Emitting confirm event')
    emit('confirm')
  } else {
    console.log('📝 [KModalActions] submitType is submit, form will handle it')
  }
}
</script>
