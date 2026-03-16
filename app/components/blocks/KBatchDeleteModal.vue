<template>
  <UiKModal :is-open="isOpen" size="md" @close="close">
    <UiKModalHeader title="⚠️ APAGAR ASSINATURAS" />

    <form @submit.prevent="handleConfirm" class="space-y-6">
      <!-- Aviso -->
      <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <div class="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500 flex-shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div>
            <h3 class="text-sm font-bold text-red-400 mb-1">ATENÇÃO: AÇÃO IRREVERSÍVEL</h3>
            <p class="text-xs text-white/70">
              Você está prestes a apagar <span class="font-bold text-red-400">{{ subscriptions.length }} assinatura(s)</span>.
              Esta ação NÃO pode ser desfeita e todos os dados serão perdidos permanentemente.
            </p>
          </div>
        </div>
      </div>

      <!-- Lista de assinaturas -->
      <div class="space-y-2">
        <h4 class="text-[10px] font-bold uppercase tracking-widest text-white/50">Assinaturas que serão apagadas:</h4>
        <div class="max-h-40 overflow-y-auto custom-scrollbar space-y-2">
          <div 
            v-for="sub in subscriptions" 
            :key="sub.id"
            class="bg-white/5 border border-white/10 rounded-lg p-3"
          >
            <div class="text-xs font-bold text-white">{{ sub.customer_name || sub.company_name || 'Cliente não vinculado' }}</div>
            <div class="text-[10px] text-white/50 mt-0.5">{{ sub.plan_name }} - R$ {{ sub.amount }}</div>
          </div>
        </div>
      </div>

      <!-- Confirmação rigorosa -->
      <div class="space-y-3">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-[10px] font-bold uppercase tracking-widest text-white/50">
              Para confirmar, digite: <span class="text-red-400 font-black">APAGAR {{ subscriptions.length }}</span>
            </label>
            <button
              type="button"
              @click="copyToClipboard"
              class="flex items-center gap-1.5 px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg transition-all group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-white/50 group-hover:text-white">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span class="text-[9px] font-bold text-white/50 group-hover:text-white uppercase tracking-wider">
                {{ copied ? 'Copiado!' : 'Copiar' }}
              </span>
            </button>
          </div>
          <input 
            v-model="confirmText"
            type="text"
            :placeholder="`Digite exatamente: APAGAR ${subscriptions.length}`"
            class="w-full bg-white/[0.03] border border-red-500/30 rounded-xl px-5 py-3 text-sm text-white outline-none focus:border-red-500 transition-all font-medium placeholder:text-white/20"
            @keyup.enter="handleConfirm"
          />
        </div>

        <div v-if="confirmText && confirmText !== `APAGAR ${subscriptions.length}`" class="text-xs text-red-400">
          ❌ Texto incorreto. Digite exatamente "APAGAR {{ subscriptions.length }}" (sem aspas)
        </div>
      </div>

      <UiKModalActions
        cancel-text="Cancelar"
        confirm-text="APAGAR PERMANENTEMENTE"
        loading-text="APAGANDO..."
        :loading="loading"
        :disabled="confirmText !== `APAGAR ${subscriptions.length}`"
        submit-type="submit"
        @cancel="close"
        @confirm="handleConfirm"
      />
    </form>
  </UiKModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  subscriptions: any[]
}>()

const emit = defineEmits(['close', 'confirm'])

const confirmText = ref('')
const loading = ref(false)
const copied = ref(false)

const copyToClipboard = async () => {
  const textToCopy = `APAGAR ${props.subscriptions.length}`
  try {
    await navigator.clipboard.writeText(textToCopy)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Erro ao copiar:', err)
  }
}

const handleConfirm = () => {
  if (confirmText.value === `APAGAR ${props.subscriptions.length}`) {
    console.log('✅ [KBatchDeleteModal] Confirmação válida, emitindo evento confirm')
    console.log('✅ [KBatchDeleteModal] Assinaturas a deletar:', props.subscriptions.map(s => ({ id: s.id, name: s.customer_name })))
    loading.value = true
    emit('confirm')
  } else {
    console.log('❌ [KBatchDeleteModal] Confirmação inválida')
    console.log('❌ [KBatchDeleteModal] Esperado:', `APAGAR ${props.subscriptions.length}`)
    console.log('❌ [KBatchDeleteModal] Recebido:', confirmText.value)
  }
}

const close = () => {
  confirmText.value = ''
  loading.value = false
  emit('close')
}

watch(() => props.isOpen, (val) => {
  if (!val) {
    confirmText.value = ''
    loading.value = false
    copied.value = false
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(239, 68, 68, 0.3);
  border-radius: 10px;
}
</style>
