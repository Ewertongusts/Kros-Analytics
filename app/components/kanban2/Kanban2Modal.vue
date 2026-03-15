<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">
          {{ task?.id ? 'Editar Tarefa' : 'Nova Tarefa' }}
        </h2>
        <button class="close-btn" @click="emit('close')">✕</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="modal-form">
        <!-- Title -->
        <div class="form-group">
          <label for="title">Título *</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="Digite o título da tarefa"
            required
          />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="description">Descrição</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Digite a descrição da tarefa"
            rows="4"
          />
        </div>

        <!-- Status -->
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="formData.status">
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="emit('close')">
            Cancelar
          </button>
          <button
            v-if="task?.id"
            type="button"
            class="btn btn-danger"
            @click="handleDelete"
          >
            Deletar
          </button>
          <button type="submit" class="btn btn-primary">
            {{ task?.id ? 'Atualizar' : 'Criar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Task } from '~/composables/useTasks'

interface Props {
  task?: Task
  columnId: string
  isOpen?: boolean
}

interface Emits {
  save: [task: Task]
  delete: [taskId: string]
  close: []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formData = ref({
  title: '',
  description: '',
  status: 'todo'
})

/**
 * Carrega dados da tarefa quando modal abre
 */
watch(
  () => props.task,
  (task) => {
    if (task) {
      formData.value = {
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo'
      }
    } else {
      formData.value = {
        title: '',
        description: '',
        status: 'todo'
      }
    }
  },
  { immediate: true }
)

/**
 * Submete o formulário
 */
const handleSubmit = () => {
  if (!formData.value.title.trim()) {
    alert('Título é obrigatório')
    return
  }

  const taskData: Task = {
    id: props.task?.id,
    title: formData.value.title,
    description: formData.value.description,
    column_id: props.columnId,
    status: formData.value.status,
    created_at: props.task?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  emit('save', taskData)
}

/**
 * Deleta a tarefa
 */
const handleDelete = () => {
  if (!props.task?.id) return

  if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return

  emit('delete', props.task.id)
}
</script>

<style scoped lang="css">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.25rem;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

/* Form */
.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

/* Actions */
.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-primary:active {
  background: #1d4ed8;
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-secondary:active {
  background: #9ca3af;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-danger:active {
  background: #b91c1c;
}

/* Responsivo */
@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-form {
    padding: 1rem;
    gap: 1rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
