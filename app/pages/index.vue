<template>
  <div class="min-h-screen flex items-center justify-center bg-[#0A0A0B] px-4 py-8">
    
    <!-- Card Premium -->
    <div class="w-full max-w-[380px] bg-[#1a1a1d] border border-white/10 rounded-xl p-6 shadow-2xl">
      
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <div v-if="settings.logo_url" class="w-16 h-16 rounded-lg overflow-hidden">
          <img :src="settings.logo_url" :alt="settings.system_name" class="w-full h-full object-contain" />
        </div>
        <div v-else class="w-16 h-16 btn-primary rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-xl">{{ settings.system_name?.charAt(0).toUpperCase() || 'K' }}</span>
        </div>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="handleLogin" class="space-y-5">
        
        <!-- Email -->
        <div class="space-y-2">
          <label class="block text-xs font-medium text-white/70 uppercase tracking-wider">E-mail</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="legendaryagencias@gmail.com"
            required
            class="w-full px-3 py-2.5 bg-[#2a2a2d] border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-kros-blue transition-colors"
          />
        </div>

        <!-- Senha -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-medium text-white/70 uppercase tracking-wider">Senha</label>
            <button type="button" class="text-xs font-medium text-kros-blue hover:text-kros-blue/80 transition-colors uppercase tracking-wider">
              Esqueci minha senha
            </button>
          </div>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            required
            class="w-full px-3 py-2.5 bg-[#2a2a2d] border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-kros-blue transition-colors"
          />
        </div>

        <!-- Lembrar -->
        <div class="flex items-center gap-2 py-1">
          <div class="relative">
            <input 
              type="checkbox" 
              id="remember" 
              v-model="rememberMe"
              class="sr-only"
            />
            <label 
              for="remember" 
              class="flex items-center justify-center w-4 h-4 bg-[#2a2a2d] border border-white/20 rounded cursor-pointer transition-colors"
              :class="rememberMe ? 'btn-primary border-transparent' : 'hover:border-white/30'"
            >
              <svg 
                v-if="rememberMe" 
                class="w-2.5 h-2.5 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </label>
          </div>
          <label for="remember" class="text-xs font-medium text-white/70 select-none cursor-pointer">
            Salvar dados para o próximo acesso
          </label>
        </div>

        <!-- Erro -->
        <p v-if="error" class="text-red-400 text-xs font-medium text-center py-1">{{ error }}</p>

        <!-- Botão -->
        <button 
          type="submit" 
          :disabled="loading" 
          class="w-full btn-primary text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 uppercase tracking-wider text-sm disabled:opacity-50"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
        
        <!-- Cadastro -->
        <div class="text-center pt-3">
          <span class="text-xs text-white/60 uppercase tracking-wider">Ainda não tem conta? </span>
          <button type="button" class="text-xs text-kros-blue font-medium hover:text-kros-blue/80 transition-colors uppercase tracking-wider">
            Inscreva-se
          </button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import { useWhiteLabel } from '~/composables/useWhiteLabel'

definePageMeta({
  middleware: 'guest',
  ssr: false
})

const { settings } = useWhiteLabel()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const rememberMe = ref(false)

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

onMounted(() => {
  const savedEmail = localStorage.getItem('kros_remember_email')
  if (savedEmail) {
    email.value = savedEmail
    rememberMe.value = true
  }
})
</script>
