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

const DEFAULT_COLUMNS = [
  { column_id: 'col_todo', name: 'A Fazer', status: 'todo', color: '#ef4444', position: 0 },
  { column_id: 'col_in_progress', name: 'Em Progresso', status: 'in_progress', color: '#f59e0b', position: 1 },
  { column_id: 'col_done', name: 'Concluído', status: 'done', color: '#10b981', position: 2 }
]

export const useKanbanColumns = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const columns = ref<KanbanColumn[]>([])
  const loading = ref(false)

  const cleanupOrphanColumns = async () => {
    if (!user.value?.id) return

    try {
      console.log('🧹 [cleanupOrphanColumns] Limpando colunas órfãs...')
      const userId = user.value.id || user.value.sub

      // Deletar colunas que não têm um status válido
      const { error } = await (supabase
        .from('kanban_columns') as any)
        .delete()
        .neq('status', 'todo')
        .neq('status', 'in_progress')
        .neq('status', 'done')
        .eq('user_id', userId)

      if (error) {
        console.error('❌ [cleanupOrphanColumns] Erro ao deletar colunas órfãs:', error)
      } else {
        console.log('✅ [cleanupOrphanColumns] Colunas órfãs deletadas')
      }
    } catch (err) {
      console.error('❌ [cleanupOrphanColumns] Erro geral:', err)
    }
  }

  const migrateOrphanTasks = async () => {
    if (!user.value?.id) return

    try {
      console.log('🔄 [migrateOrphanTasks] Migrando tarefas órfãs...')
      
      // Buscar tarefas sem column_id
      const { data: orphanTasks, error: fetchError } = await (supabase
        .from('tasks') as any)
        .select('id, status')
        .is('column_id', null)

      if (fetchError) {
        console.error('❌ [migrateOrphanTasks] Erro ao buscar tarefas órfãs:', fetchError)
        return
      }

      if (!orphanTasks || orphanTasks.length === 0) {
        console.log('✅ [migrateOrphanTasks] Nenhuma tarefa órfã encontrada')
        return
      }

      console.log(`📊 [migrateOrphanTasks] Encontradas ${orphanTasks.length} tarefas órfãs`)

      // Atualizar cada tarefa com column_id baseado no status
      for (const task of orphanTasks) {
        const columnId = task.status === 'todo' ? 'col_todo' 
                        : task.status === 'in_progress' ? 'col_in_progress'
                        : 'col_done'

        const { error: updateError } = await (supabase
          .from('tasks') as any)
          .update({ column_id: columnId })
          .eq('id', task.id)

        if (updateError) {
          console.error(`❌ [migrateOrphanTasks] Erro ao atualizar tarefa ${task.id}:`, updateError)
        } else {
          console.log(`✅ [migrateOrphanTasks] Tarefa ${task.id} migrada para ${columnId}`)
        }
      }

      console.log('✅ [migrateOrphanTasks] Migração concluída')
    } catch (err) {
      console.error('❌ [migrateOrphanTasks] Erro geral:', err)
    }
  }

  const initializeDefaultColumns = async () => {
    if (!user.value?.id) {
      console.warn('⚠️ [initializeDefaultColumns] Usuário não autenticado')
      return
    }

    try {
      console.log('🔄 [initializeDefaultColumns] Inicializando colunas padrão...')
      const userId = user.value.id || user.value.sub
      console.log(`   userId: ${userId}`)

      for (const defaultCol of DEFAULT_COLUMNS) {
        console.log(`   Verificando coluna: ${defaultCol.name} (status: ${defaultCol.status})`)
        
        const { data: existing, error: checkError } = await (supabase
          .from('kanban_columns') as any)
          .select('*')
          .eq('column_id', defaultCol.column_id)
          .eq('user_id', userId)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          console.error(`   ❌ Erro ao verificar coluna:`, checkError)
          continue
        }

        if (!existing) {
          console.log(`   📝 Criando coluna padrão: ${defaultCol.name}`)
          const { data: created, error: insertError } = await (supabase
            .from('kanban_columns') as any)
            .insert([{
              ...defaultCol,
              user_id: userId
            }])
            .select()
            .single()

          if (insertError) {
            console.error(`   ❌ Erro ao criar coluna:`, insertError)
          } else {
            console.log(`   ✅ Coluna criada:`, created)
          }
        } else {
          console.log(`   ✅ Coluna já existe:`, existing)
        }
      }
      
      console.log('✅ [initializeDefaultColumns] Inicialização concluída')
    } catch (err) {
      console.error('❌ [initializeDefaultColumns] Erro geral:', err)
    }
  }

  const fetchColumns = async () => {
    if (!user.value?.id) {
      console.warn('⚠️ Usuário não autenticado, usando localStorage')
      loadFromLocalStorage()
      return
    }

    loading.value = true
    try {
      console.log('🔍 Buscando colunas customizadas do banco...')
      
      // Migrar tarefas órfãs primeiro
      await migrateOrphanTasks()
      
      // Inicializar colunas padrão se não existirem
      await initializeDefaultColumns()

      const { data, error } = await (supabase
        .from('kanban_columns') as any)
        .select('*')
        .order('position', { ascending: true })

      if (error) {
        console.error('❌ [fetchColumns] Erro ao buscar colunas:', error)
        loadFromLocalStorage()
        return
      }

      console.log('✅ [fetchColumns] Colunas recebidas:', data?.length || 0)
      console.log('   Colunas:', data?.map((c: any) => ({ id: c.column_id, name: c.name, status: c.status })))
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
      const { data, error } = await (supabase
        .from('kanban_columns') as any)
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
        columns.value[idx] = { ...columns.value[idx], ...updates } as any
        saveToLocalStorage()
      }
      return
    }

    loading.value = true
    try {
      const { error } = await (supabase
        .from('kanban_columns') as any)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        } as any)
        .eq('column_id', columnId)

      if (error) throw error

      console.log('✅ Coluna atualizada')
      const idx = columns.value.findIndex(c => c.column_id === columnId)
      if (idx !== -1) {
        columns.value[idx] = { ...columns.value[idx], ...updates } as any
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
      console.log(`🗑️ [deleteColumn] Deletando coluna: ${columnId}`)
      
      // Não deletar as tarefas, apenas remover a coluna
      // As tarefas ficarão órfãs e aparecerão na seção "Tarefas Órfãs"
      const { error } = await (supabase
        .from('kanban_columns') as any)
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
    console.log('🔄 moveColumn chamado:', { columnId, newPosition, totalColumns: columns.value.length })
    
    const column = columns.value.find(c => c.column_id === columnId)
    if (!column) {
      console.error('❌ Coluna não encontrada:', columnId)
      return
    }

    const newColumns = columns.value.filter(c => c.column_id !== columnId)
    newColumns.splice(newPosition, 0, column)

    newColumns.forEach((col, idx) => {
      col.position = idx
    })

    columns.value = newColumns
    console.log('✅ Colunas reordenadas localmente:', columns.value.map(c => ({ name: c.name, position: c.position })))

    if (!user.value?.id) {
      console.log('💾 Salvando no localStorage')
      saveToLocalStorage()
      return
    }

    loading.value = true
    try {
      for (const col of columns.value) {
        const { error } = await (supabase
          .from('kanban_columns') as any)
          .update({ position: col.position })
          .eq('column_id', col.column_id)
        
        if (error) {
          console.error('❌ Erro ao atualizar posição:', error)
          throw error
        }
      }

      console.log('✅ Posições atualizadas no banco')
      saveToLocalStorage()
    } catch (err) {
      console.error('❌ Erro ao mover coluna:', err)
      await fetchColumns()
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
    clearLocalStorage,
    migrateOrphanTasks,
    cleanupOrphanColumns
  }
}
