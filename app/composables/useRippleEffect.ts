import { ref } from 'vue'

export interface RipplePosition {
  x: number
  y: number
  size: number
}

export const useRippleEffect = () => {
  const ripples = ref<RipplePosition[]>([])

  const createRipple = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLElement
    const rect = button.getBoundingClientRect()
    
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const size = Math.max(rect.width, rect.height)

    const ripple: RipplePosition = {
      x,
      y,
      size
    }

    ripples.value.push(ripple)

    // Remove ripple after animation completes
    setTimeout(() => {
      ripples.value = ripples.value.filter(r => r !== ripple)
    }, 600)
  }

  return {
    ripples,
    createRipple
  }
}
