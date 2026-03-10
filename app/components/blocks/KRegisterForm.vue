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
      <UiKButton type="submit">
        Criar Conta
      </UiKButton>
    </div>
    
    <div class="text-center mt-6">
      <span class="text-sm text-kros-text/60 dark:text-kros-surface/60">Já tem uma conta? </span>
      <NuxtLink to="/" class="text-sm text-kros-text dark:text-kros-surface font-semibold hover:text-kros-blue transition-colors">
        Faça login
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

const handleRegister = () => {
  if (password.value !== passwordConfirm.value) {
    alert("As senhas não coincidem!")
    return
  }

  console.log('Cadastro submetido:', {
    name: name.value,
    email: email.value,
    password: password.value
  })
}
</script>
