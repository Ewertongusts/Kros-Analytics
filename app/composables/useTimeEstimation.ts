import { computed } from 'vue'

export type TimeUnit = 'hours' | 'days'

export interface TimeEstimation {
  estimated_hours?: number
  estimated_days?: number
  time_unit: TimeUnit
}

export const useTimeEstimation = () => {
  // Converter horas para dias (8 horas = 1 dia)
  const hoursToDays = (hours: number): number => {
    return Math.round((hours / 8) * 100) / 100
  }

  // Converter dias para horas
  const daysToHours = (days: number): number => {
    return Math.round(days * 8 * 100) / 100
  }

  // Formatar estimativa para exibição
  const formatEstimation = (estimation: TimeEstimation | undefined): string => {
    if (!estimation) return '-'

    if (estimation.time_unit === 'hours' && estimation.estimated_hours) {
      const hours = estimation.estimated_hours
      if (hours < 1) {
        return `${Math.round(hours * 60)}min`
      }
      if (hours === Math.floor(hours)) {
        return `${Math.floor(hours)}h`
      }
      return `${hours.toFixed(1)}h`
    }

    if (estimation.time_unit === 'days' && estimation.estimated_days) {
      const days = estimation.estimated_days
      if (days === Math.floor(days)) {
        return `${Math.floor(days)}d`
      }
      return `${days.toFixed(1)}d`
    }

    return '-'
  }

  // Obter valor em horas (normalizado)
  const getHours = (estimation: TimeEstimation | undefined): number => {
    if (!estimation) return 0

    if (estimation.time_unit === 'hours' && estimation.estimated_hours) {
      return estimation.estimated_hours
    }

    if (estimation.time_unit === 'days' && estimation.estimated_days) {
      return daysToHours(estimation.estimated_days)
    }

    return 0
  }

  // Obter valor em dias (normalizado)
  const getDays = (estimation: TimeEstimation | undefined): number => {
    if (!estimation) return 0

    if (estimation.time_unit === 'days' && estimation.estimated_days) {
      return estimation.estimated_days
    }

    if (estimation.time_unit === 'hours' && estimation.estimated_hours) {
      return hoursToDays(estimation.estimated_hours)
    }

    return 0
  }

  // Calcular tempo total de múltiplas tarefas
  const calculateTotalTime = (estimations: (TimeEstimation | undefined)[], unit: TimeUnit = 'hours'): number => {
    const totalHours = estimations.reduce((sum, est) => sum + getHours(est), 0)

    if (unit === 'days') {
      return hoursToDays(totalHours)
    }

    return totalHours
  }

  // Obter cor baseada na estimativa
  const getEstimationColor = (estimation: TimeEstimation | undefined): string => {
    const hours = getHours(estimation)

    if (hours === 0) return 'text-white/50'
    if (hours <= 2) return 'text-green-400'
    if (hours <= 8) return 'text-yellow-400'
    if (hours <= 24) return 'text-orange-400'
    return 'text-red-400'
  }

  // Obter ícone baseado na estimativa
  const getEstimationIcon = (estimation: TimeEstimation | undefined): string => {
    const hours = getHours(estimation)

    if (hours === 0) return '⏱️'
    if (hours <= 2) return '⚡'
    if (hours <= 8) return '⏰'
    if (hours <= 24) return '📅'
    return '⚠️'
  }

  return {
    hoursToDays,
    daysToHours,
    formatEstimation,
    getHours,
    getDays,
    calculateTotalTime,
    getEstimationColor,
    getEstimationIcon
  }
}
