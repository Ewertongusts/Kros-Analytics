import { ref } from 'vue'
import type { Task } from './useTasks'
import { useTasks } from './useTasks'

export const useTaskHandlers = () => {
  const { tasks, loading, createTask, updateTask, deleteTask: deleteTaskApi, fetchTasks } = useTasks()
  
  const isTaskModalOpen = ref(false)
  const selectedTask = ref<Task | null>(null)
  const loadingAction = ref(false)
  const defaultColumnId = ref<string>('')

  const openTaskModal = (task?: Task, columnId?: string) => {
    console.log('🎯 [openTaskModal] Abrindo modal:', { task, columnId })
    selectedTask.value = task || null
    defaultColumnId.value = columnId || ''
    isTaskModalOpen.value = true
    console.log('🎯 [openTaskModal] Modal aberto:', { isTaskModalOpen: isTaskModalOpen.value, defaultColumnId: defaultColumnId.value })
  }

  const closeTaskModal = () => {
    isTaskModalOpen.value = false
    selectedTask.value = null
    defaultColumnId.value = ''
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    console.log('🚀 [handleSaveTask] Iniciando salvamento:', taskData)
    loadingAction.value = true
    try {
      if (selectedTask.value?.id) {
        // Atualizar tarefa existente
        console.log('✏️ [handleSaveTask] Editando tarefa existente:', selectedTask.value.id)
        console.log('📋 [handleSaveTask] Dados originais:', selectedTask.value)
        console.log('📝 [handleSaveTask] Dados para atualização:', taskData)
        
        const result = await updateTask(selectedTask.value.id, taskData)
        console.log('📊 [handleSaveTask] Resultado da atualização:', result)
        
        if (result.success) {
          console.log('✅ [handleSaveTask] Tarefa atualizada com sucesso')
          // Fazer um fetch para garantir que os dados estão sincronizados
          console.log('🔄 [handleSaveTask] Fazendo fetch para sincronizar dados')
          await fetchTasks()
          console.log('✅ [handleSaveTask] Fetch concluído')
        } else {
          console.error('❌ [handleSaveTask] Erro ao atualizar tarefa:', result.error)
          throw new Error(result.error)
        }
      } else {
        // Criar nova tarefa
        const tasksInColumn = defaultColumnId.value 
          ? tasks.value.filter(t => t.column_id === defaultColumnId.value)
          : []
        const newPosition = tasksInColumn.length
        
        const newTask = { 
          ...taskData, 
          column_id: defaultColumnId.value || undefined,
          position: newPosition
        } as Task
        console.log('🆕 [handleSaveTask] Criando nova tarefa:', newTask)
        console.log('📍 [handleSaveTask] Coluna padrão:', defaultColumnId.value)
        console.log('📊 [handleSaveTask] Posição calculada:', newPosition)
        
        const result = await createTask(newTask)
        console.log('📊 [handleSaveTask] Resultado da criação:', result)
        
        if (result.success) {
          console.log('✅ [handleSaveTask] Nova tarefa criada com sucesso')
          console.log('🔄 [handleSaveTask] Fazendo fetch para sincronizar dados')
          await fetchTasks()
          console.log('✅ [handleSaveTask] Fetch concluído')
        } else {
          console.error('❌ [handleSaveTask] Erro ao criar tarefa:', result.error)
          throw new Error(result.error)
        }
      }
      console.log('🎉 [handleSaveTask] Salvamento concluído, fechando modal')
      closeTaskModal()
    } catch (error) {
      console.error('❌ [handleSaveTask] Erro geral ao salvar tarefa:', error)
      // Não fechar o modal em caso de erro para que o usuário possa tentar novamente
    } finally {
      loadingAction.value = false
      console.log('🏁 [handleSaveTask] Processo finalizado')
    }
  }

  const deleteTask = async (id: string) => {
    loadingAction.value = true
    try {
      await deleteTaskApi(id)
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
    } finally {
      loadingAction.value = false
    }
  }

  const moveTask = (
    taskId: string,
    newColumnId: string,
    targetTaskId?: string,
    position?: 'above' | 'below'
  ) => {
    try {
      console.log('[MOVE-TASK] 🚀 moveTask CALLED', {
        taskId,
        newColumnId,
        targetTaskId,
        position,
        timestamp: new Date().toISOString()
      })

      const task = tasks.value.find(t => t.id === taskId)
      if (!task) {
        console.warn('[MOVE-TASK] ⚠️ Task not found:', taskId)
        return
      }

      console.log('[MOVE-TASK] 📍 Task found', {
        taskId: task.id,
        taskTitle: task.title,
        currentColumnId: task.column_id,
        currentPosition: task.position
      })

      let newPosition = task.position ?? 0
      const isMovingBetweenColumns = newColumnId !== task.column_id
      
      console.log('[MOVE-TASK] 🔍 Analyzing move', {
        isMovingBetweenColumns,
        hasTargetTaskId: !!targetTaskId,
        hasPosition: !!position
      })
      
      if (targetTaskId && position) {
        // Posicionar relativo a um card específico
        console.log('[MOVE-TASK] 📌 Using target task positioning', {
          targetTaskId,
          position
        })
        
        const targetTask = tasks.value.find(t => t.id === targetTaskId)
        if (targetTask) {
          // Usar inteiros para evitar erro no banco
          const targetPos = targetTask.position ?? 0
          newPosition = position === 'above' ? targetPos : targetPos + 1
          
          console.log('[MOVE-TASK] ✅ Position calculated from target', {
            targetTaskPosition: targetPos,
            newPosition,
            positionType: position
          })
        } else {
          console.warn('[MOVE-TASK] ⚠️ Target task not found:', targetTaskId)
        }
      } else if (isMovingBetweenColumns) {
        // Movendo entre colunas sem target específico
        // Colocar no final da coluna de destino
        console.log('[MOVE-TASK] 📌 Moving between columns without target - placing at end')
        
        const tasksInNewColumn = tasks.value.filter(t => t.column_id === newColumnId && t.id !== taskId)
        if (tasksInNewColumn.length === 0) {
          newPosition = 0
        } else {
          newPosition = Math.max(...tasksInNewColumn.map(t => t.position ?? 0)) + 1
        }
        
        console.log('[MOVE-TASK] ✅ Position calculated for end of column', {
          tasksInNewColumn: tasksInNewColumn.length,
          newPosition
        })
      } else {
        console.log('[MOVE-TASK] ℹ️ Same column reordering without target')
      }

      // Garantir que é inteiro
      newPosition = Math.floor(newPosition)

      console.log('[MOVE-TASK] 💾 Updating local state', {
        taskId,
        oldColumnId: task.column_id,
        newColumnId,
        oldPosition: task.position,
        newPosition
      })

      // Atualizar estado local imediatamente
      task.column_id = newColumnId
      task.position = newPosition
      
      console.log('[MOVE-TASK] 🔄 Persisting to database', {
        taskId,
        column_id: newColumnId,
        position: newPosition
      })
      
      // Persistir no banco de dados
      updateTask(taskId, { 
        column_id: newColumnId,
        position: newPosition
      }).then(() => {
        console.log('[MOVE-TASK] ✅ Database update successful', {
          taskId,
          newColumnId,
          newPosition
        })
      }).catch(err => {
        console.error('[MOVE-TASK] ❌ Database update failed', {
          taskId,
          error: err?.message
        })
      })
    } catch (error) {
      console.error('[MOVE-TASK] ❌ Critical error in moveTask', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  const duplicateTask = async (task: Task) => {
    loadingAction.value = true
    try {
      const duplicatedTask: Task = {
        title: `${task.title} (cópia)`,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        company_id: task.company_id,
        assigned_to: task.assigned_to,
        column_id: task.column_id,
        position: task.position
      }
      
      await createTask(duplicatedTask)
    } catch (error) {
      console.error('❌ Erro ao duplicar tarefa:', error)
    } finally {
      loadingAction.value = false
    }
  }

  return {
    tasks,
    loading,
    fetchTasks,
    isTaskModalOpen,
    selectedTask,
    loadingAction,
    defaultColumnId,
    openTaskModal,
    closeTaskModal,
    handleSaveTask,
    deleteTask,
    moveTask,
    duplicateTask
  }
}
