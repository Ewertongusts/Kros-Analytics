/**
 * Composable para gerenciar configurações de CRON
 */

import { ref, computed } from 'vue'

export const useCronManagement = () => {
  const supabase = useSupabaseClient()
  const loading = ref(false)
  const cronReports = ref<any[]>([])
  const cronSchedules = ref<any[]>([])

  /**
   * Buscar relatórios de execução do CRON
   */
  const fetchCronReports = async (limit = 50) => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('cron_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      cronReports.value = data || []
      console.log('✅ Relatórios de CRON carregados:', cronReports.value.length)
    } catch (err: any) {
      console.error('❌ Erro ao buscar relatórios:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Buscar configurações de CRON
   */
  const fetchCronSchedules = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('cron_schedules')
        .select('*')
        .order('hour', { ascending: true })

      if (error) throw error

      cronSchedules.value = data || []
      console.log('✅ Configurações de CRON carregadas:', cronSchedules.value.length)
    } catch (err: any) {
      console.error('❌ Erro ao buscar configurações:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Atualizar configuração de CRON
   */
  const updateCronSchedule = async (scheduleId: string, updates: any) => {
    loading.value = true
    try {
      const { error } = await supabase
        .from('cron_schedules')
        .update(updates)
        .eq('id', scheduleId)

      if (error) throw error

      console.log('✅ Configuração atualizada:', scheduleId)
      await fetchCronSchedules()
      return true
    } catch (err: any) {
      console.error('❌ Erro ao atualizar:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Executar CRON manualmente
   */
  const executeCronManually = async (scheduleId: string) => {
    loading.value = true
    try {
      const cronSecret = process.env.NUXT_PUBLIC_CRON_SECRET || 'kros-cron-secret-123'

      const response = await fetch(`/api/cron/billing-v2?schedule_id=${scheduleId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cronSecret}`
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ CRON executado:', result)

      // Recarregar relatórios
      await fetchCronReports()

      return result
    } catch (err: any) {
      console.error('❌ Erro ao executar CRON:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Obter estatísticas dos relatórios
   */
  const cronStats = computed(() => {
    if (cronReports.value.length === 0) {
      return {
        totalExecutions: 0,
        totalSent: 0,
        totalFailed: 0,
        totalSkipped: 0,
        successRate: 0,
        averageExecutionTime: 0
      }
    }

    const stats = cronReports.value.reduce(
      (acc, report) => ({
        totalExecutions: acc.totalExecutions + 1,
        totalSent: acc.totalSent + (report.sent_count || 0),
        totalFailed: acc.totalFailed + (report.failed_count || 0),
        totalSkipped: acc.totalSkipped + (report.skipped_count || 0),
        totalExecutionTime: acc.totalExecutionTime + (report.execution_time_ms || 0)
      }),
      {
        totalExecutions: 0,
        totalSent: 0,
        totalFailed: 0,
        totalSkipped: 0,
        totalExecutionTime: 0
      }
    )

    const successRate = stats.totalSent > 0
      ? ((stats.totalSent / (stats.totalSent + stats.totalFailed)) * 100).toFixed(2)
      : 0

    return {
      ...stats,
      successRate: parseFloat(successRate as string),
      averageExecutionTime: Math.round(stats.totalExecutionTime / stats.totalExecutions)
    }
  })

  /**
   * Obter últimas execuções por schedule
   */
  const getLatestExecutionBySchedule = (scheduleId: string) => {
    return cronReports.value.find(r => r.schedule_id === scheduleId)
  }

  /**
   * Formatar tempo de execução
   */
  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  return {
    loading,
    cronReports,
    cronSchedules,
    cronStats,
    fetchCronReports,
    fetchCronSchedules,
    updateCronSchedule,
    executeCronManually,
    getLatestExecutionBySchedule,
    formatExecutionTime
  }
}
