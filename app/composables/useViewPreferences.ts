import { ref, watch } from 'vue'

export interface ViewPreferences {
  isCompact: boolean
  rememberPreferences: boolean
  searchQuery: string
  selectedTags: string[]
  activeFilter: string
  subscriptionStatusFilter: string[]
}

const STORAGE_KEY = 'collection-view-preferences'

// Estado global compartilhado entre todas as instâncias
const globalState = {
  isCompact: ref(false),
  rememberPreferences: ref(true),
  searchQuery: ref(''),
  selectedTags: ref<string[]>([]),
  activeFilter: ref('Todos'),
  subscriptionStatusFilter: ref<string[]>([]),
  isLoaded: ref(false)
}

export const useViewPreferences = () => {
  // Carregar preferências do localStorage
  const loadPreferences = () => {
    if (process.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const prefs = JSON.parse(stored) as ViewPreferences
          globalState.isCompact.value = prefs.isCompact ?? false
          globalState.rememberPreferences.value = prefs.rememberPreferences ?? true
          globalState.searchQuery.value = prefs.searchQuery ?? ''
          globalState.selectedTags.value = prefs.selectedTags ?? []
          globalState.activeFilter.value = prefs.activeFilter ?? 'Todos'
          globalState.subscriptionStatusFilter.value = prefs.subscriptionStatusFilter ?? []
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error)
      }
      globalState.isLoaded.value = true
    }
  }

  // Salvar preferências no localStorage
  const savePreferences = () => {
    if (process.client && globalState.rememberPreferences.value) {
      try {
        const prefs: ViewPreferences = {
          isCompact: globalState.isCompact.value,
          rememberPreferences: globalState.rememberPreferences.value,
          searchQuery: globalState.searchQuery.value,
          selectedTags: globalState.selectedTags.value,
          activeFilter: globalState.activeFilter.value,
          subscriptionStatusFilter: globalState.subscriptionStatusFilter.value
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
        console.log('Preferências salvas:', prefs)
      } catch (error) {
        console.error('Erro ao salvar preferências:', error)
      }
    }
  }

  // Resetar preferências
  const resetPreferences = () => {
    globalState.isCompact.value = false
    globalState.rememberPreferences.value = true
    globalState.searchQuery.value = ''
    globalState.selectedTags.value = []
    globalState.activeFilter.value = 'Todos'
    globalState.subscriptionStatusFilter.value = []
    if (process.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    isCompact: globalState.isCompact,
    rememberPreferences: globalState.rememberPreferences,
    searchQuery: globalState.searchQuery,
    selectedTags: globalState.selectedTags,
    activeFilter: globalState.activeFilter,
    subscriptionStatusFilter: globalState.subscriptionStatusFilter,
    isLoaded: globalState.isLoaded,
    loadPreferences,
    savePreferences,
    resetPreferences
  }
}
