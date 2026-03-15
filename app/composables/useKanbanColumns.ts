import { ref, computed } from 'vue'

export interface KanbanColumn {
  id?: string
  user_id?: string
  column_id: string
  name: string
  color: string
  status: string
  position: number
  created_at?: string
  updated_at?: string
}

export const useKanbanColumns = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const columns = ref<KanbanColumn[]>([])
  const loading = ref(false)

  const fetchColumns = async () => {
    if (!user.value?.id) {
      console.warn('⚠️ Usuário não autenticado, usando localStorage')
      loadFromLocalStorage()
      return
    }

    loading.value = true
    try {
      console.log('🔍 Buscando colunas customizadas do banco...')
      const { data, error } = await supabase
        .from('kanban_columns')
        .select('*')
        .order('position', { ascending: true })

      if (error) {
        console.error('❌ Erro ao buscar colunas:', error)
        loadFromLocalStorage()
        return
      }

      console.log('✅ Colunas recebidas:', data?.length || 0)
      columns.value = data || []
      saveToLocalStorage()
    } catch (err) {
      console.error('❌ Erro ao buscar colunas:', err)
      loadFromLocalStorage()
    } finally {
      loading.value = false
    }
  }

  const addColumn = async (column: Omit<KanbanColumn, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const userId = user.value?.id || user.value?.sub
    
    if (!userId) {
      console.warn('⚠️ Usuário não autenticado, salvando apenas no localStorage')
      const newColumn: KanbanColumn = {
        ...column,
        position: columns.value.length
      }
      columns.value.push(newColumn)
      saveToLocalStorage()
      return
    }

    loading.value = true
    try {
      const newColumn = {
        ...column,
        user_id: userId,
        position: columns.value.length
      }

      console.log('📤 Adicionando coluna:', newColumn)
      const { data, error } = await supabase
        .from('kanban_columns')
        .insert([newColumn])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Coluna adicionada:', data)
      columns.value.push(data)
      saveToLocalStorage()
    } catch (err) {
      console.error('❌ Erro ao adicionar coluna:', err)
    } finally {
      loading.value = false
    }
  }

  const updateColumn = async (columnId: string, updates: Partial<KanbanColumn>) => {
    if (!user.value?.id) {
      const idx = columns.value.findIndex(c => c.column_id === columnId)
      if (idx !== -1) {
        columns.value[idx] = { ...columns.value[idx], ...updates }
        saveToLocalStorage()
      }
      return
    }

    loading.value = true
    try {
      const { error } = await supabase
        .from('kanban_columns')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('column_id', columnId)

      if (error) throw error

      console.log('✅ Coluna atualizada')
      const idx = columns.value.findIndex(c => c.column_id === columnId)
      if (idx !== -1) {
        columns.value[idx] = { ...columns.value[idx], ...updates }
        saveToLocalStorage()
      }
    } catch (err) {
      console.error('❌ Erro ao atualizar coluna:', err)
    } finally {
      loading.value = false
    }
  }

  const deleteColumn = async (columnId: string) => {
    if (!user.value?.id) {
      columns.value = columns.value.filter(c => c.column_id !== columnId)
      saveToLocalStorage()
      return
    }

    loading.value = true
    try {
      const { error } = await supabase
        .from('kanban_columns')
        .delete()
        .eq('column_id', columnId)

      if (error) throw error

      console.log('✅ Coluna deletada')
      columns.value = columns.value.filter(c => c.column_id !== columnId)
      saveToLocalStorage()
    } catch (err) {
      console.error('❌ Erro ao deletar coluna:', err)
    } finally {
      loading.value = false
    }
  }

  const moveColumn = async (columnId: string, newPosition: number) => {
    const column = columns.value.find(c => c.column_id === columnId)
    if (!column) return

    // Atualizar localmente primeiro
    columns.value = columns.value.filter(c => c.column_id !== columnId)
    columns.value.splice(newPosition, 0, column)

    // Atualizar posições
    columns.value.forEach((col, idx) => {
      col.position = idx
    })

    if (!user.value?.id) {
      saveToLocalStorage()
      return
    }

    loading.value = true
    try {
      // Atualizar todas as posições no banco
      const updates = columns.value.map(col => ({
        column_id: col.column_id,
        position: col.position
      }))

      for (const update of updates) {
        await supabase
          .from('kanban_columns')
          .update({ position: update.position })
          .eq('column_id', update.column_id)
      }

      console.log('✅ Posições atualizadas')
    } catch (err) {
      console.error('❌ Erro ao mover coluna:', err)
    } finally {
      loading.value = false
    }
  }

  const saveToLocalStorage = () => {
    localStorage.setItem('kanban_custom_columns', JSON.stringify(columns.value))
  }

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('kanban_custom_columns')
    if (saved) {
      try {
        columns.value = JSON.parse(saved)
        console.log('📦 Colunas carregadas do localStorage:', columns.value.length)
      } catch (e) {
        console.error('❌ Erro ao carregar do localStorage:', e)
      }
    }
  }

  const clearLocalStorage = () => {
    localStorage.removeItem('kanban_custom_columns')
    console.log('🗑️ localStorage limpo')
  }

  return {
    columns,
    loading,
    fetchColumns,
    addColumn,
    updateColumn,
    deleteColumn,
    moveColumn,
    clearLocalStorage
  }
}
