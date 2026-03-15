<template>
  <button
    :class="[
      'relative overflow-hidden transition-all',
      buttonClass
    ]"
    @click="handleClick"
    v-bind="$attrs"
  >
    <!-- Ripple effects -->
    <span
      v-for="(ripple, index) in ripples"
      :key="index"
      class="ripple-effect"
      :style="{
        left: ripple.x + 'px',
        top: ripple.y + 'px',
        width: ripple.size + 'px',
        height: ripple.size + 'px'
      }"
    />

    <!-- Button content -->
    <slot />
  </button>
</template>

<script setup lang="ts">
import { useRippleEffect } from '~/composables/useRippleEffect'

defineProps<{
  buttonClass?: string
}>()

const emit = defineEmits(['click'])
const { ripples, createRipple } = useRippleEffect()

const handleClick = (event: MouseEvent) => {
  createRipple(event)
  emit('click', event)
}
</script>

<style scoped>
.ripple-effect {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: ripple-animation 0.6s ease-out;
}

@keyframes ripple-animation {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}
</style>
