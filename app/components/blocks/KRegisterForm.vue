<template>
  <form @submit.prevent="handleRegister" class="space-y-6">
    <UiKInput 
      id="name" 
      label="Nome Completo" 
      v-model="name" 
      type="text" 
      placeholder="Seu nome completo" 
      required
    />

    <UiKInput 
      id="email" 
      label="E-mail" 
      v-model="email" 
      type="email" 
      placeholder="seu@email.com" 
      required
    />

    <div class="space-y-1.5">
      <label for="password" class="block text-sm font-medium text-kros-text dark:text-kros-surface">Senha</label>
      <UiKInput 
        id="password" 
        v-model="password" 
        type="password" 
        placeholder="••••••••" 
        required
      />
    </div>

    <div class="space-y-1.5">
      <label for="passwordConfirm" class="block text-sm font-medium text-kros-text dark:text-kros-surface">Confirmar Senha</label>
      <UiKInput 
        id="passwordConfirm" 
        v-model="passwordConfirm" 
        type="password" 
        placeholder="••••••••" 
        required
      />
    </div>

    <div class="pt-2">
      <p v-if="error" class="text-red-500 text-sm mb-3 text-center">{{ error }}</p>
      <div v-if="success" class="text-green-400 text-sm mb-3 text-center p-3 rounded-lg bg-green-400/10">
        Conta criada! Verifique seu e-mail para confirmar o cadastro.
      </div>
      <UiKButton type="submit" :disabled="loading || success">
        {{ loading ? 'Criando conta...' : 'Criar Conta' }}
      </UiKButton>
    </div>
    
    <div class="text-center mt-6">
      <span class="text-sm text-white/60">Já tem uma conta? </span>
      <NuxtLink to="/" class="text-sm text-white font-semibold hover:text-kros-blue transition-colors">
        Faça login
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const supabase = useSupabaseClient()
const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

const handleRegister = async () => {
  if (password.value !== passwordConfirm.value) {
    error.value = 'As senhas não coincidem.'
    return
  }

  loading.value = true
  error.value = ''

  const { error: err } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: { full_name: name.value }
    }
  })

  if (err) {
    error.value = err.message
  } else {
    success.value = true
  }

  loading.value = false
}
</script>

