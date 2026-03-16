export const useTasksMigration = () => {
  const supabase = useSupabaseClient()

  const migrateTasksColumnId = async () => {
    try {
      const { data: allTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id, status, column_id')

      if (fetchError) {
        console.error('Erro ao buscar tarefas:', fetchError)
        return
      }

      const tasksWithoutColumnId = allTasks?.filter(t => !t.column_id) || []

      if (tasksWithoutColumnId.length === 0) {
        return
      }

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
          console.error(`Erro ao atualizar tarefa ${task.id}:`, updateError)
          errorCount++
        } else {
          successCount++
        }
      }
    } catch (error) {
      console.error('Erro durante migração:', error)
    }
  }

  return {
    migrateTasksColumnId
  }
}
