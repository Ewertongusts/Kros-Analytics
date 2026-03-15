import { ref, computed } from 'vue'
import type { Task } from '~/composables/useTasks'

const CACHE_KEY = 'tasks_cache'
const CACHE_EXPIRY_KEY = 'tasks_cache_expiry'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export const useTaskCache = () => {
  const isCacheValid = () => {
    if (typeof window === 'undefined') return false
    
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    if (!expiry) return false
    
    return Date.now() < parseInt(expiry)
  }

  const getCachedTasks = (): Task[] | null => {
    if (typeof window === 'undefined') return null
    
    if (!isCacheValid()) {
      clearCache()
      return null
    }

    try {
      const cached = localStorage.getItem(CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Erro ao ler cache:', error)
      clearCache()
      return null
    }
  }

  const setCachedTasks = (tasks: Task[]) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(tasks))
      localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString())
    } catch (error) {
      console.error('Erro ao salvar cache:', error)
    }
  }

  const clearCache = () => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_EXPIRY_KEY)
    } catch (error) {
      console.error('Erro ao limpar cache:', error)
    }
  }

  const getCacheSize = () => {
    if (typeof window === 'undefined') return 0

    try {
      const cached = localStorage.getItem(CACHE_KEY)
      return cached ? new Blob([cached]).size : 0
    } catch (error) {
      return 0
    }
  }

  const getCacheInfo = () => {
    if (typeof window === 'undefined') return null

    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    if (!expiry) return null

    const expiryTime = parseInt(expiry)
    const now = Date.now()
    const timeRemaining = Math.max(0, expiryTime - now)

    return {
      isValid: isCacheValid(),
      size: getCacheSize(),
      expiresIn: timeRemaining,
      expiresAt: new Date(expiryTime)
    }
  }

  return {
    getCachedTasks,
    setCachedTasks,
    clearCache,
    isCacheValid,
    getCacheSize,
    getCacheInfo
  }
}
