export const useTasksMigration = () => {
  const supabase = useSupabaseClient()

  const migrateTasksColumnId = async () => {
    try {
      console.log('🔄 Iniciando migração de column_id para tarefas...')
      
      // Buscar TODAS as tarefas (com e sem column_id)
      const { data: allTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id, status, column_id')

      if (fetchError) {
        console.error('❌ Erro ao buscar tarefas:', fetchError)
        return
      }

      console.log(`📋 Total de tarefas no banco: ${allTasks?.length || 0}`)
      console.log('📊 Distribuição:', {
        comColumnId: allTasks?.filter(t => t.column_id).length || 0,
        semColumnId: allTasks?.filter(t => !t.column_id).length || 0
      })

      // Filtrar apenas as que não têm column_id
      const tasksWithoutColumnId = allTasks?.filter(t => !t.column_id) || []

      console.log(`🔍 Encontradas ${tasksWithoutColumnId.length} tarefas sem column_id`)

      if (tasksWithoutColumnId.length === 0) {
        console.log('✅ Nenhuma tarefa para migrar')
        return
      }

      // Atualizar cada tarefa com o column_id baseado no status
      let successCount = 0
      let errorCount = 0

      for (const task of tasksWithoutColumnId) {
        let columnId = 'col_todo'
        
        if (task.status === 'in_progress') {
          columnId = 'col_in_progress'
        } else if (task.status === 'done') {
          columnId = 'col_done'
        }

        const { error: updateError } = await supabase
          .from('tasks')
          .update({ column_id: columnId })
          .eq('id', task.id)

        if (updateError) {
          console.error(`❌ Erro ao atualizar tarefa ${task.id}:`, updateError)
          errorCount++
        } else {
          console.log(`✅ Tarefa ${task.id} atualizada com column_id: ${columnId}`)
          successCount++
        }
      }

      console.log(`✅ Migração concluída! ${successCount} sucesso, ${errorCount} erros`)
    } catch (error) {
      console.error('❌ Erro durante migração:', error)
    }
  }

  return {
    migrateTasksColumnId
  }
}
