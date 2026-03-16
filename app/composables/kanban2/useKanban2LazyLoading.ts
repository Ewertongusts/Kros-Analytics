import { ref, readonly, computed } from 'vue'
import type { Task } from '../useTasks'
import type { Column } from './useKanban2Data'

/**
 * Composable para lazy loading de tarefas
 * Responsabilidade única: Gerenciar carregamento incremental de tarefas
 * 
 * Características:
 * - Carregar tarefas em chunks
 * - Detectar quando scroll chega ao final
 * - Gerenciar estado de carregamento
 * - Readonly exports
 */
export const useKanban2LazyLoading = () => {
  const PAGE_SIZE = 50
  const currentPage = ref(0)
  const isLoading = ref(false)
  const hasMore = ref(true)
  const error = ref<string | null>(null)
  const loadedTasks = ref<Task[]>([])

  /**
   * Carrega próxima página de tarefas
   */
  const loadNextPage = async (
    fetchFn: (page: number, pageSize: number) => Promise<Task[]>
  ): Promise<void> => {
    if (isLoading.value || !hasMore.value) return

    isLoading.value = true
    error.value = null

    try {
      const newTasks = await fetchFn(currentPage.value, PAGE_SIZE)

      if (newTasks.length < PAGE_SIZE) {
        hasMore.value = false
      }

      loadedTasks.value.push(...newTasks)
      currentPage.value++
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar tarefas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Reseta o estado de lazy loading
   */
  const reset = (): void => {
    currentPage.value = 0
    isLoading.value = false
    hasMore.value = true
    error.value = null
    loadedTasks.value = []
  }

  /**
   * Carrega tarefas iniciais
   */
  const loadInitial = async (
    fetchFn: (page: number, pageSize: number) => Promise<Task[]>
  ): Promise<void> => {
    reset()
    await loadNextPage(fetchFn)
  }

  /**
   * Verifica se deve carregar mais (quando scroll chega ao final)
   */
  const shouldLoadMore = (scrollPercentage: number): boolean => {
    return scrollPercentage > 80 && !isLoading.value && hasMore.value
  }

  /**
   * Calcula percentual de scroll
   */
  const calculateScrollPercentage = (
    scrollTop: number,
    scrollHeight: number,
    clientHeight: number
  ): number => {
    if (scrollHeight === 0) return 0
    return ((scrollTop + clientHeight) / scrollHeight) * 100
  }

  /**
   * Retorna quantidade de tarefas carregadas
   */
  const loadedCount = computed(() => loadedTasks.value.length)

  /**
   * Retorna página atual
   */
  const currentPageNumber = computed(() => currentPage.value)

  return {
    loadedTasks: readonly(loadedTasks),
    isLoading: readonly(isLoading),
    hasMore: readonly(hasMore),
    error: readonly(error),
    loadNextPage,
    reset,
    loadInitial,
    shouldLoadMore,
    calculateScrollPercentage,
    loadedCount,
    currentPageNumber,
    PAGE_SIZE
  }
}
