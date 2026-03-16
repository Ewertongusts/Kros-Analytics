<template>
  <UiKModal :isOpen="true" @close="$emit('close')" size="lg">
    <template #header>
      <h2 class="text-xl font-bold text-white">
        {{ isEditing ? 'Editar Usuário' : 'Novo Usuário' }}
      </h2>
    </template>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">
            Nome Completo *
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20"
            placeholder="Digite o nome completo"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">
            Email *
          </label>
          <input
            v-model="form.email"
            type="email"
            required
            :disabled="isEditing"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Digite o email"
          />
          <p v-if="isEditing" class="text-xs text-white/50 mt-1">
            O email não pode ser alterado após a criação
          </p>
        </div>
      </div>

      <!-- Password (only for new users) -->
      <div v-if="!isEditing">
        <label class="block text-sm font-medium text-white/80 mb-2">
          Senha *
        </label>
        <input
          v-model="form.password"
          type="password"
          required
          minlength="6"
          class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20"
          placeholder="Digite a senha (mínimo 6 caracteres)"
        />
      </div>

      <!-- Role -->
      <div>
        <label class="block text-sm font-medium text-white/80 mb-2">
          Perfil de Acesso *
        </label>
        <select
          v-model="form.role"
          required
          class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20"
        >
          <option value="">Selecione um perfil</option>
          <option value="admin">Administrador</option>
          <option value="manager">Gerente</option>
          <option value="user">Usuário</option>
        </select>
        <div class="mt-2 text-xs text-white/60">
          <div class="space-y-1">
            <p><strong>Administrador:</strong> Acesso total ao sistema</p>
            <p><strong>Gerente:</strong> Acesso a relatórios e gestão</p>
            <p><strong>Usuário:</strong> Acesso básico às funcionalidades</p>
          </div>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Full Name -->
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">
            Nome de Exibição
          </label>
          <input
            v-model="form.full_name"
            type="text"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20"
            placeholder="Nome para exibição"
          />
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">
            Telefone
          </label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20"
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          @click="$emit('close')"
          class="px-6 py-3 rounded-xl border border-white/10 text-white/80 hover:text-white hover:border-white/20 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Salvando...
          </span>
          <span v-else>
            {{ isEditing ? 'Atualizar' : 'Criar Usuário' }}
          </span>
        </button>
      </div>
    </form>
  </UiKModal>
</template>

<script setup lang="ts">
import type { User } from '~/composables/useUsers'

interface Props {
  user?: User | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [userData: any]
}>()

const loading = ref(false)

const isEditing = computed(() => !!props.user)

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: '',
  full_name: '',
  phone: ''
})

const handleSubmit = async () => {
  loading.value = true
  
  try {
    const userData: any = {
      name: form.name,
      email: form.email,
      role: form.role as 'admin' | 'manager' | 'user',
      full_name: form.full_name || form.name,
      phone: form.phone
    }

    if (!isEditing.value) {
      userData.password = form.password
    }

    emit('save', userData)
  } catch (error) {
    console.error('Error in form submission:', error)
  } finally {
    loading.value = false
  }
}

// Initialize form with user data if editing
watch(() => props.user, (user) => {
  if (user) {
    form.name = user.name
    form.email = user.email
    form.role = user.role
    form.full_name = user.name // Will be overridden by profile data if available
    form.phone = ''
  } else {
    // Reset form for new user
    Object.assign(form, {
      name: '',
      email: '',
      password: '',
      role: '',
      full_name: '',
      phone: ''
    })
  }
}, { immediate: true })
</script>