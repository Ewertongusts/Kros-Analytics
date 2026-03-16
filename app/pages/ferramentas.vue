<template>
  <LayoutsKPageLayout>
    <UiKSkeleton v-if="loading" type="table" :rows="5" />

    <div v-else class="space-y-6 mb-20 animate-in fade-in duration-700">
      <!-- Header -->
      <div class="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-black text-white mb-2">Gerenciamento de Usuários</h1>
          <p class="text-sm text-white/60">Gerencie usuários, perfis e permissões do sistema</p>
        </div>

        <UiKButtonPrimary icon="plus" @click="openCreateModal">
          Novo Usuário
        </UiKButtonPrimary>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <!-- Total Users -->
        <div class="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-400">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Total Usuários</p>
              <p class="text-2xl font-black text-white">{{ userStats.total }}</p>
            </div>
          </div>
        </div>

        <!-- Admins -->
        <div class="p-6 rounded-2xl bg-white/[0.02] border border-red-500/20">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Administradores</p>
              <p class="text-2xl font-black text-white">{{ userStats.admins }}</p>
            </div>
          </div>
        </div>

        <!-- Managers -->
        <div class="p-6 rounded-2xl bg-white/[0.02] border border-yellow-500/20">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-400">
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"></path>
                <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7"></path>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Gerentes</p>
              <p class="text-2xl font-black text-white">{{ userStats.managers }}</p>
            </div>
          </div>
        </div>

        <!-- Regular Users -->
        <div class="p-6 rounded-2xl bg-white/[0.02] border border-green-500/20">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-white/40">Usuários</p>
              <p class="text-2xl font-black text-white">{{ userStats.users }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3 flex-wrap mb-6">
        <!-- Search -->
        <div class="flex-1 min-w-[200px] max-w-[300px]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar usuário..."
            class="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/20 text-sm"
          />
        </div>

        <!-- Role Filter -->
        <select
          v-model="roleFilter"
          class="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 text-sm"
        >
          <option value="">Todos os Perfis</option>
          <option value="admin">Administrador</option>
          <option value="manager">Gerente</option>
          <option value="user">Usuário</option>
        </select>
      </div>

      <!-- Users Table -->
      <div class="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-white/[0.02] border-b border-white/10">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-widest">Usuário</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-widest">Email</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-widest">Perfil</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-white/60 uppercase tracking-widest">Criado em</th>
                <th class="px-6 py-4 text-right text-xs font-bold text-white/60 uppercase tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-white/[0.02] transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span class="text-sm font-bold text-white">{{ getInitials(user.name) }}</span>
                    </div>
                    <div>
                      <p class="font-semibold text-white">{{ user.name }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-white/80">{{ user.email }}</span>
                </td>
                <td class="px-6 py-4">
                  <span :class="getRoleBadgeClass(user.role)" class="px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-white/60 text-sm">{{ formatDate(user.created_at) }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      @click="editUser(user)"
                      class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                      title="Editar usuário"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      @click="confirmDeleteUser(user)"
                      class="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                      title="Excluir usuário"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3,6 5,6 21,6"></polyline>
                        <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-if="filteredUsers.length === 0" class="text-center py-12">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/40">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">Nenhum usuário encontrado</h3>
          <p class="text-white/60 mb-4">Não há usuários que correspondam aos filtros aplicados.</p>
        </div>
      </div>
    </div>

    <!-- Create/Edit User Modal -->
    <ToolsKUserModal
      v-if="showUserModal"
      :user="selectedUser"
      @close="closeUserModal"
      @save="handleSaveUser"
    />
  </LayoutsKPageLayout>
</template>

<script setup lang="ts">
import type { User } from '~/composables/useUsers'

definePageMeta({
  title: 'Ferramentas - Usuários',
  description: 'Gerenciamento de usuários do sistema'
})

const { users, loading, userStats, fetchUsers, createUser, updateUser, deleteUser } = useUsers()

// State
const searchQuery = ref('')
const roleFilter = ref('')
const showUserModal = ref(false)
const selectedUser = ref<User | null>(null)

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  // Filter by role
  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  return filtered
})

// Methods
const openCreateModal = () => {
  selectedUser.value = null
  showUserModal.value = true
}

const editUser = (user: User) => {
  selectedUser.value = user
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  selectedUser.value = null
}

const handleSaveUser = async (userData: any) => {
  try {
    if (selectedUser.value) {
      // Update existing user
      await updateUser(selectedUser.value.id, userData)
    } else {
      // Create new user
      await createUser(userData)
    }
    closeUserModal()
  } catch (error) {
    console.error('Error saving user:', error)
  }
}

const confirmDeleteUser = async (user: User) => {
  if (confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) {
    try {
      await deleteUser(user.id)
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const getRoleLabel = (role: string) => {
  const labels = {
    admin: 'Admin',
    manager: 'Gerente',
    user: 'Usuário'
  }
  return labels[role as keyof typeof labels] || role
}

const getRoleBadgeClass = (role: string) => {
  const classes = {
    admin: 'bg-red-500/20 text-red-400',
    manager: 'bg-yellow-500/20 text-yellow-400',
    user: 'bg-green-500/20 text-green-400'
  }
  return classes[role as keyof typeof classes] || 'bg-gray-500/20 text-gray-400'
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('pt-BR')
}

// Lifecycle
onMounted(() => {
  fetchUsers()
})
</script>