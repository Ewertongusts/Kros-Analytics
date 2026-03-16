<template>
  <div class="min-h-screen flex items-center justify-center bg-[#0A0A0B] px-4 py-8">
    
    <!-- Card Premium -->
    <div class="w-full max-w-[400px] bg-[#1a1a1d] border border-white/10 rounded-xl p-8 shadow-2xl">
      
      <!-- Logo -->
      <div class="flex justify-center mb-8">
        <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
            <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- Formulário -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        
        <!-- Email -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-white/70 uppercase tracking-wider">E-mail</label>
          <input 
            v-model="email" 
            type="email" 
            placeholder="seu@email.com"
            required
            class="w-full px-4 py-3 bg-[#2a2a2d] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <!-- Senha -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-sm font-medium text-white/70 uppercase tracking-wider">Senha</label>
            <button type="button" class="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">
              Esqueci minha senha
            </button>
          </div>
          <input 
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            required
            class="w-full px-4 py-3 bg-[#2a2a2d] border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <!-- Lembrar -->
        <div class="flex items-center gap-3">
          <input 
            type="checkbox" 
            id="remember" 
            v-model="rememberMe"
            class="w-4 h-4 rounded border-white/20 bg-[#2a2a2d] text-blue-500 focus:ring-blue-500 focus:ring-2"
          />
          <label for="remember" class="text-sm font-medium text-white/70 select-none">
            Salvar dados para o próximo acesso
          </label>
        </div>

        <!-- Erro -->
        <p v-if="error" class="text-red-400 text-sm font-medium text-center">{{ error }}</p>

        <!-- Botão -->
        <button 
          type="submit" 
          :disabled="loading" 
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 uppercase tracking-wider text-sm"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
        
        <!-- Cadastro -->
        <div class="text-center pt-4">
          <span class="text-sm text-white/60 uppercase tracking-wider">Ainda não tem conta? </span>
          <button type="button" class="text-sm text-white font-medium hover:text-blue-400 transition-colors uppercase tracking-wider">
            Inscreva-se
          </button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'guest',
  ssr: false
})

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
