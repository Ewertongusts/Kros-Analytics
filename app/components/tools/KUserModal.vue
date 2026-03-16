<template>
  <UiKModal :is-open="true" @close="$emit('close')" size="md" max-height="max-h-[85vh]">
    <div class="flex flex-col h-full max-h-[75vh]">
      <!-- Header Fixo -->
      <div class="flex items-center justify-between p-5 pb-3 flex-shrink-0">
        <h2 class="text-base font-semibold text-white">
          {{ isEditing ? 'Editar Usuário' : 'Novo Usuário' }}
        </h2>
        <button 
          @click="$emit('close')"
          class="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Conteúdo com Scroll -->
      <div class="flex-1 overflow-y-auto px-5 custom-scrollbar">
        <form @submit.prevent="handleSubmit" class="space-y-3">
        <!-- Avatar -->
        <div class="flex flex-col items-center mb-4">
          <div class="relative">
            <div class="w-20 h-20 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden">
              <img 
                v-if="avatarUrl" 
                :src="avatarUrl" 
                :alt="form.name || 'Avatar'"
                class="w-full h-full object-cover"
              />
              <svg v-else class="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <button
              type="button"
              @click="triggerFileInput"
              :disabled="avatarUploading"
              class="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
              title="Alterar foto"
            >
              <svg v-if="!avatarUploading" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <svg v-else class="animate-spin w-3 h-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleAvatarUpload"
            class="hidden"
          />
          <p class="text-[9px] text-white/40 mt-2 text-center">
            Clique no + para adicionar foto
          </p>
        </div>
        <!-- Nome e Email -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Nome Completo</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-white/20 focus:outline-none transition-all"
              placeholder="Digite o nome completo"
            />
          </div>

          <div>
            <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              :disabled="isEditing"
              class="w-full px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-white/20 focus:outline-none transition-all disabled:opacity-50"
              placeholder="Digite o email"
            />
            <p v-if="isEditing" class="text-[9px] text-white/40 mt-1">
              O email não pode ser alterado após a criação
            </p>
          </div>
        </div>

        <!-- Senha (apenas para novos usuários) -->
        <div v-if="!isEditing">
          <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Senha</label>
          <input
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="w-full px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-white/20 focus:outline-none transition-all"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <!-- Nova Senha (para edição) -->
        <div v-if="isEditing">
          <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Nova Senha</label>
          <input
            v-model="form.password"
            type="password"
            minlength="6"
            class="w-full px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-white/20 focus:outline-none transition-all"
            placeholder="Deixe em branco para manter a senha atual"
          />
          <p class="text-[9px] text-white/40 mt-1">
            Deixe em branco se não quiser alterar a senha
          </p>
        </div>

        <!-- Perfil de Acesso -->
        <div>
          <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Perfil de Acesso</label>
          <select
            v-model="form.role"
            required
            class="w-full px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-sm text-white focus:border-white/20 focus:outline-none transition-all"
            style="color-scheme: dark;"
          >
            <option value="">Selecione um perfil</option>
            <option value="admin" style="background-color: #1c1c1e; color: white;">Administrador</option>
            <option value="manager" style="background-color: #1c1c1e; color: white;">Gerente</option>
            <option value="user" style="background-color: #1c1c1e; color: white;">Usuário</option>
          </select>
          <div class="mt-1.5 text-[9px] text-white/50 space-y-0.5">
            <p><span class="text-white/60">Administrador:</span> Acesso total ao sistema</p>
            <p><span class="text-white/60">Gerente:</span> Acesso a relatórios e gestão</p>
            <p><span class="text-white/60">Usuário:</span> Acesso básico às funcionalidades</p>
          </div>
        </div>

        <!-- Nome de Exibição e Telefone -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Nome de Exibição</label>
            <input
              v-model="form.full_name"
              type="text"
              class="w-full px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-white/20 focus:outline-none transition-all"
              placeholder="Nome para exibição"
            />
          </div>

          <div>
            <label class="block text-[10px] font-medium uppercase tracking-wider text-white/40 mb-1.5">Telefone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-3 py-2 bg-[#1c1c1e] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:border-white/20 focus:outline-none transition-all"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>
        </form>
      </div>

      <!-- Footer Fixo com Botões -->
      <div class="flex items-center gap-2 p-5 pt-4 border-t border-white/5 flex-shrink-0">
        <button
          type="button"
          @click="$emit('close')"
          class="flex-1 px-3 py-2 bg-[#1c1c1e] hover:bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:text-white transition-all font-medium"
        >
          Cancelar
        </button>
        <button
          @click="handleSubmit"
          :disabled="loading || avatarUploading"
          class="flex-1 px-3 py-2 rounded-lg text-sm text-white transition-all font-medium disabled:cursor-not-allowed hover:opacity-90"
          :style="{ 
            backgroundColor: (loading || avatarUploading) ? 'var(--kros-blue, #3b82f6)' : 'var(--kros-blue, #3b82f6)',
            opacity: (loading || avatarUploading) ? 0.5 : 1
          }"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Salvando...
          </span>
          <span v-else-if="avatarUploading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enviando foto...
          </span>
          <span v-else>
            {{ isEditing ? 'Atualizar' : 'Criar' }}
          </span>
        </button>
      </div>
    </div>
  </UiKModal>
</template>

<script setup lang="ts">
import type { User } from '~/composables/useUsers'
import { useUserAvatar } from '~/composables/useUserAvatar'

interface Props {
  user?: User | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: [userData: any]
}>()

const loading = ref(false)
const fileInput = ref<HTMLInputElement>()
const avatarUrl = ref('')

const { uploading: avatarUploading, uploadAvatar } = useUserAvatar()

const isEditing = computed(() => !!props.user)

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: '',
  full_name: '',
  phone: ''
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleAvatarUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Validar tipo de arquivo
  if (!file.type.startsWith('image/')) {
    alert('Por favor, selecione apenas arquivos de imagem.')
    return
  }

  // Validar tamanho (máximo 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('A imagem deve ter no máximo 5MB.')
    return
  }

  try {
    const userId = props.user?.id || `temp-${Date.now()}`
    const result = await uploadAvatar(file, userId)
    
    if (result.success && result.url) {
      avatarUrl.value = result.url
    } else {
      alert('Erro ao fazer upload da imagem: ' + (result.error || 'Erro desconhecido'))
    }
  } catch (error) {
    console.error('Error uploading avatar:', error)
    alert('Erro ao fazer upload da imagem.')
  }

  // Limpar o input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

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

    // Incluir avatar se foi carregado
    if (avatarUrl.value) {
      userData.avatar_url = avatarUrl.value
    }

    // Incluir senha apenas se for novo usuário ou se foi preenchida na edição
    if (!isEditing.value) {
      userData.password = form.password
    } else if (form.password && form.password.trim() !== '') {
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
    avatarUrl.value = (user as any).avatar_url || ''
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
    avatarUrl.value = ''
  }
}, { immediate: true })
</script>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>