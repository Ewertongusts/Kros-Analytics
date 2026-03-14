import { ref } from 'vue'

export interface LogsViewPreferences {
  rememberPreferences: boolean
  searchQuery: string
  typeFilter: 'all' | 'cron' | 'manual'
  statusFilter: 'all' | 'success' | 'error'
}

const STORAGE_KEY = 'logs-view-preferences'

// Estado global compartilhado
const globalState = {
  rememberPreferences: ref(true),
  isLoaded: ref(false)
}

export const useLogsViewPreferences = () => {
  // Carregar preferências do localStorage
  const loadPreferences = () => {
    if (process.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const prefs = JSON.parse(stored) as LogsViewPreferences
          globalState.rememberPreferences.value = prefs.rememberPreferences ?? true
        }
      } catch (error) {
        console.error('Erro ao carregar preferências de logs:', error)
      }
      globalState.isLoaded.value = true
    }
  }

  // Salvar preferências no localStorage
  const savePreferences = (prefs: Partial<LogsViewPreferences>) => {
    if (process.client && globalState.rememberPreferences.value) {
      try {
        const currentPrefs = localStorage.getItem(STORAGE_KEY)
        const merged = {
          ...(currentPrefs ? JSON.parse(currentPrefs) : {}),
          ...prefs,
          rememberPreferences: globalState.rememberPreferences.value
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        console.log('Preferências de logs salvas:', merged)
      } catch (error) {
        console.error('Erro ao salvar preferências de logs:', error)
      }
    }
  }

  // Resetar preferências
  const resetPreferences = () => {
    globalState.rememberPreferences.value = true
    if (process.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    rememberPreferences: globalState.rememberPreferences,
    isLoaded: globalState.isLoaded,
    loadPreferences,
    savePreferences,
    resetPreferences
  }
}
