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
      <p class="text-xs text-white/80 mt-2">
        Enviaremos as instruções de recuperação de senha para o seu WhatsApp.
      </p>
    </div>

    <div class="pt-2">
      <p v-if="error" class="text-red-400 text-sm mb-3 text-center">{{ error }}</p>
      <p v-if="success" class="text-emerald-400 text-sm mb-3 text-center">Instruções enviadas com sucesso!</p>
      <UiKButton type="submit" :disabled="loading" class="font-bold">
        {{ loading ? 'Enviando...' : 'Enviar' }}
      </UiKButton>
    </div>
    
    <div class="text-center mt-6">
      <span class="text-sm text-white/60">Lembrou da sua senha? </span>
      <NuxtLink to="/" class="text-sm text-kros-text dark:text-kros-surface font-semibold hover:text-kros-blue transition-colors">
        Voltar ao login
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const supabase = useSupabaseClient()
const whatsapp = ref('+55 ')
const error = ref('')
const success = ref(false)
const loading = ref(false)

watch(whatsapp, (newValue, oldValue) => {
  if (newValue === oldValue) return
  if (newValue.length < 4) { whatsapp.value = '+55 '; return }
  if (oldValue && newValue.length < oldValue.length) return

  let v = newValue.replace(/\D/g, '')
  if (!v.startsWith('55')) v = '55' + v

  let formatted = '+55 '
  if (v.length > 2) formatted += `(${v.substring(2, 4)}`
  if (v.length >= 4) formatted += `) ${v.substring(4, 9)}`
  if (v.length >= 9) formatted += `-${v.substring(9, 13)}`
  if (formatted.length > 19) formatted = formatted.substring(0, 19)

  if (whatsapp.value !== formatted) whatsapp.value = formatted
})

const handleRecover = async () => {
  loading.value = true
  error.value = ''
  success.value = false

  const { error: err } = await supabase.auth.resetPasswordForEmail(whatsapp.value, {
    redirectTo: `${window.location.origin}/confirm`
  })

  if (err) {
    error.value = 'Não foi possível enviar as instruções. Verifique o número.'
  } else {
    success.value = true
  }

  loading.value = false
}
</script>
