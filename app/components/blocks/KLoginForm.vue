<template>
  <form @submit.prevent="handleLogin" class="space-y-6">
    <UiKInput 
      id="email" 
      label="E-mail" 
      v-model="email" 
      type="email" 
      placeholder="seu@email.com" 
      required
    />

    <div class="space-y-1.5">
      <div class="flex items-center justify-between">
        <label for="password" class="block text-sm font-medium text-kros-text dark:text-kros-surface">Senha</label>
        <NuxtLink to="/recuperar-senha" class="text-xs font-medium text-kros-blue hover:text-blue-600 transition-colors">
          Esqueci minha senha
        </NuxtLink>
      </div>
      <UiKInput 
        id="password" 
        v-model="password" 
        type="password" 
        placeholder="••••••••" 
        required
      />
    </div>

    <div class="pt-2">
      <p v-if="error" class="text-red-500 text-sm mb-3 text-center">{{ error }}</p>
      <UiKButton type="submit" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </UiKButton>
    </div>
    
    <div class="text-center mt-6">
      <span class="text-sm text-kros-text/60 dark:text-kros-surface/60">Ainda não tem conta? </span>
      <NuxtLink to="/cadastro" class="text-sm text-kros-text dark:text-kros-surface font-semibold hover:text-kros-blue transition-colors">
        Inscreva-se
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (err) {
    error.value = 'E-mail ou senha inválidos.'
  } else {
    await navigateTo('/dashboard')
  }

  loading.value = false
}
</script>
