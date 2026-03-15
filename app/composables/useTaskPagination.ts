import { ref, computed } from 'vue'

export const useTaskPagination = (itemsPerPage = 20) => {
  const currentPage = ref(1)
  const totalItems = ref(0)
  const itemsPerPageRef = ref(itemsPerPage)

  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPageRef.value))

  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPageRef.value)
  const endIndex = computed(() => currentPage.value * itemsPerPageRef.value)

  const paginatedItems = (items: any[]) => {
    return items.slice(startIndex.value, endIndex.value)
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const resetPagination = () => {
    currentPage.value = 1
  }

  const setTotalItems = (count: number) => {
    totalItems.value = count
  }

  const canNextPage = computed(() => currentPage.value < totalPages.value)
  const canPrevPage = computed(() => currentPage.value > 1)

  return {
    currentPage,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    itemsPerPage: itemsPerPageRef,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
    resetPagination,
    setTotalItems,
    canNextPage,
    canPrevPage
  }
}
