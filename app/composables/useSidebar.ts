import { ref } from 'vue'

const isExpanded = ref(true)

export const useSidebar = () => {
  const toggleSidebar = () => {
    isExpanded.value = !isExpanded.value
  }

  const setExpanded = (value: boolean) => {
    isExpanded.value = value
  }

  return {
    isExpanded,
    toggleSidebar,
    setExpanded
  }
}
