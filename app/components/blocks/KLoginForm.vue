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
        <label for="password" class="block text-sm font-semibold text-kros-text dark:text-white/80">Senha</label>
        <NuxtLink to="/recuperar-senha" class="text-xs font-bold text-kros-blue hover:text-blue-600 transition-colors uppercase tracking-widest">
          Esqueci minha senha
        </NuxtLink>
      </div>
      <UiKInput 
        id="password" 
        v-model="password" 
        :type="showPassword ? 'text' : 'password'" 
        placeholder="••••••••" 
        required
      >
        <template #trailing>
          <button 
            type="button" 
            @click="showPassword = !showPassword"
            class="p-1 hover:text-kros-blue text-white/40 transition-colors"
          >
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </template>
      </UiKInput>
    </div>

    <!-- Lembrar de mim -->
    <div class="flex items-center gap-2">
      <input 
        type="checkbox" 
        id="remember" 
        v-model="rememberMe"
        class="w-4 h-4 rounded border-white/10 bg-white/5 text-kros-blue focus:ring-kros-blue cursor-pointer"
      />
      <label for="remember" class="text-xs font-medium text-white/60 cursor-pointer select-none">
        Salvar dados para o próximo acesso
      </label>
    </div>

    <div class="pt-2">
      <p v-if="error" class="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-3 text-center animate-bounce">{{ error }}</p>
      <UiKButton type="submit" :disabled="loading" class="w-full !py-4 font-black uppercase tracking-[0.2em]">
        {{ loading ? 'Sincronizando...' : 'Entrar na Plataforma' }}
      </UiKButton>
    </div>
    
    <div class="text-center mt-6">
      <span class="text-xs text-white/40 uppercase tracking-widest font-medium">Ainda não tem conta? </span>
      <NuxtLink to="/cadastro" class="text-xs text-white uppercase tracking-widest font-black hover:text-kros-blue transition-all border-b-2 border-transparent hover:border-kros-blue pb-1">
        Inscreva-se
      </NuxtLink>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)

onMounted(() => {
  const savedEmail = localStorage.getItem('kros_remember_email')
  if (savedEmail) {
    email.value = savedEmail
    rememberMe.value = true
  }
})

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (err) {
    error.value = 'Acesso Negado. Verifique os dados.'
  } else {
    if (rememberMe.value) {
      localStorage.setItem('kros_remember_email', email.value)
    } else {
      localStorage.removeItem('kros_remember_email')
    }
    await navigateTo('/dashboard')
  }

  loading.value = false
}
</script>
