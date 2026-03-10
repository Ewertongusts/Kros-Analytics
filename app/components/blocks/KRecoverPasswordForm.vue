<template>
  <form @submit.prevent="handleRecover" class="space-y-6">
    <div class="space-y-1.5">
      <UiKInput 
        id="whatsapp" 
        label="WhatsApp" 
        v-model="whatsapp" 
        type="tel" 
        placeholder="(00) 00000-0000" 
        required
      />
      <p class="text-xs text-kros-text/60 dark:text-kros-surface/60 mt-2">
        Enviaremos as instruções de recuperação de senha para o seu WhatsApp.
      </p>
    </div>

    <div class="pt-2">
      <UiKButton type="submit">
        Enviar
      </UiKButton>
    </div>
    
    <div class="text-center mt-6">
      <span class="text-sm text-kros-text/60 dark:text-kros-surface/60">Lembrou da sua senha? </span>
      <NuxtLink to="/" class="text-sm text-kros-text dark:text-kros-surface font-semibold hover:text-kros-blue transition-colors">
        Voltar ao login
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const whatsapp = ref('+55 ')

watch(whatsapp, (newValue, oldValue) => {
  if (newValue === oldValue) return

  // Mantém a base +55 caso o usuário tente apagar tudo
  if (newValue.length < 4) {
    whatsapp.value = '+55 '
    return
  }

  // Permite apagar livremente, sem forçar auto-formato que trava o cursor
  if (oldValue && newValue.length < oldValue.length) {
    return
  }

  let v = newValue.replace(/\D/g, '')

  // Garante o DDI 55
  if (!v.startsWith('55')) {
    v = '55' + v
  }

  // Aplica máscara +55 (00) 00000-0000
  let formatted = '+55 '
  if (v.length > 2) {
    formatted += `(${v.substring(2, 4)}`
  }
  if (v.length >= 4) {
    formatted += `) ${v.substring(4, 9)}`
  }
  if (v.length >= 9) {
    formatted += `-${v.substring(9, 13)}`
  }

  // Limita a quantidade de caracteres para números de celular do Brasil
  if (formatted.length > 19) {
    formatted = formatted.substring(0, 19)
  }

  if (whatsapp.value !== formatted) {
    whatsapp.value = formatted
  }
})

const handleRecover = () => {
  console.log('Recuperação solicitada para:', {
    whatsapp: whatsapp.value
  })
}
</script>
