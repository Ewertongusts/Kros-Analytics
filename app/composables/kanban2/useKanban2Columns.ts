import { ref, readonly, computed } from 'vue'
import type { Column } from './useKanban2Data'

/**
 * Composable para gerenciar colunas do Kanban 2
 * Responsabilidade única: CRUD de colunas e reordenação
 * 
 * Características:
 * - Add/Update/Delete colunas
 * - Reordenar colunas
 * - Validação básica
 * - Readonly exports
 */
export const useKanban2Columns = () => {
  const columns = ref<Column[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Adiciona uma nova coluna
   */
  const addColumn = async (
    name: string,
    color?: string,
    addColumnFn?: (name: string, color?: string) => Promise<Column>
  ): Promise<Column> => {
    error.value = null

    // Validação
    if (!name || name.trim().length === 0) {
      error.value = 'Nome da coluna é obrigatório'
      throw new Error(error.value)
    }

    if (name.length > 100) {
      error.value = 'Nome da coluna não pode ter mais de 100 caracteres'
      throw new Error(error.value)
    }

    loading.value = true

    try {
      let newColumn: Column

      if (addColumnFn) {
        newColumn = await addColumnFn(name, color)
      } else {
        // Criar coluna localmente (para testes)
        newColumn = {
          id: `column-${Date.now()}`,
          name,
          color,
          order: columns.value.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      columns.value.push(newColumn)
      return newColumn
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar coluna'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Atualiza uma coluna existente
   */
  const updateColumn = async (
    columnId: string,
    updates: Partial<Column>,
    updateColumnFn?: (columnId: string, updates: Partial<Column>) => Promise<void>
  ): Promise<void> => {
    error.value = null

    // Validação
    if (updates.name && updates.name.length > 100) {
      error.value = 'Nome da coluna não pode ter mais de 100 caracteres'
      throw new Error(error.value)
    }

    loading.value = true

    try {
      if (updateColumnFn) {
        await updateColumnFn(columnId, updates)
      }

      // Atualizar estado local
      const columnIndex = columns.value.findIndex(c => c.id === columnId)
      if (columnIndex !== -1) {
        columns.value[columnIndex] = {
          ...columns.value[columnIndex],
          ...updates,
          updated_at: new Date().toISOString()
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar coluna'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Deleta uma coluna
   */
  const deleteColumn = async (
    columnId: string,
    deleteColumnFn?: (columnId: string) => Promise<void>
  ): Promise<void> => {
    error.value = null

    loading.value = true

    try {
      if (deleteColumnFn) {
        await deleteColumnFn(columnId)
      }

      // Remover do estado local
      columns.value = columns.value.filter(c => c.id !== columnId)

      // Reordenar
      columns.value.forEach((col, index) => {
        col.order = index
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar coluna'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Reordena as colunas
   */
  const reorderColumns = async (
    columnIds: string[],
    reorderColumnsFn?: (columnIds: string[]) => Promise<void>
  ): Promise<void> => {
    error.value = null

    // Validação
    if (columnIds.length !== columns.value.length) {
      error.value = 'IDs de colunas não correspondem'
      throw new Error(error.value)
    }

    loading.value = true

    try {
      if (reorderColumnsFn) {
        await reorderColumnsFn(columnIds)
      }

      // Reordenar estado local
      const newColumns = columnIds
        .map(id => columns.value.find(c => c.id === id))
        .filter((c): c is Column => c !== undefined)
        .map((c, index) => ({ ...c, order: index }))

      columns.value = newColumns
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao reordenar colunas'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Move uma coluna para uma posição específica
   */
  const moveColumn = (columnId: string, toIndex: number): void => {
    const fromIndex = columns.value.findIndex(c => c.id === columnId)

    if (fromIndex === -1 || toIndex < 0 || toIndex >= columns.value.length) {
      error.value = 'Posição inválida'
      return
    }

    const [column] = columns.value.splice(fromIndex, 1)
    columns.value.splice(toIndex, 0, column)

    // Atualizar ordem
    columns.value.forEach((col, index) => {
      col.order = index
    })
  }

  /**
   * Busca uma coluna por ID
   */
  const getColumnById = (columnId: string): Column | undefined => {
    return columns.value.find(c => c.id === columnId)
  }

  /**
   * Busca o índice de uma coluna
   */
  const getColumnIndex = (columnId: string): number => {
    return columns.value.findIndex(c => c.id === columnId)
  }

  /**
   * Retorna colunas ordenadas
   */
  const sortedColumns = computed(() => {
    return [...columns.value].sort((a, b) => a.order - b.order)
  })

  /**
   * Retorna quantidade de colunas
   */
  const columnCount = computed(() => columns.value.length)

  /**
   * Verifica se uma coluna existe
   */
  const columnExists = (columnId: string): boolean => {
    return columns.value.some(c => c.id === columnId)
  }

  /**
   * Limpa todas as colunas
   */
  const clearColumns = (): void => {
    columns.value = []
    error.value = null
  }

  return {
    columns: readonly(columns),
    loading: readonly(loading),
    error: readonly(error),
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    moveColumn,
    getColumnById,
    getColumnIndex,
    sortedColumns,
    columnCount,
    columnExists,
    clearColumns
  }
}
