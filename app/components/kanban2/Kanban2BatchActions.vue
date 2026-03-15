<template>
  <div class="batch-actions">
    <div class="batch-info">
      <span class="batch-count">{{ selectedCount }} selecionada(s)</span>
    </div>

    <div class="batch-buttons">
      <button class="batch-btn delete-btn" @click="emit('delete')">
        🗑️ Deletar
      </button>
      <button class="batch-btn close-btn" @click="emit('close')">
        ✕ Limpar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedCount: number
}

interface Emits {
  delete: []
  close: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped lang="css">
.batch-actions {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.batch-count {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.batch-buttons {
  display: flex;
  gap: 0.5rem;
}

.batch-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn {
  background: #ef4444;
  color: white;
}

.delete-btn:hover {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.delete-btn:active {
  background: #b91c1c;
}

.close-btn {
  background: #e5e7eb;
  color: #374151;
}

.close-btn:hover {
  background: #d1d5db;
}

.close-btn:active {
  background: #9ca3af;
}

/* Responsivo */
@media (max-width: 640px) {
  .batch-actions {
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    transform: none;
    flex-direction: column;
    gap: 0.75rem;
  }

  .batch-buttons {
    width: 100%;
    flex-direction: column;
  }

  .batch-btn {
    width: 100%;
  }
}
</style>
