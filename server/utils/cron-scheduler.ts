/**
 * Scheduler de CRON para executar billing-scheduled a cada minuto
 * Roda localmente durante desenvolvimento
 */

let cronJob: any = null

export function initCronScheduler() {
  // Evitar múltiplas inicializações
  if (cronJob) {
    console.log('[CRON Scheduler] Já está rodando')
    return
  }

  console.log('[CRON Scheduler] Iniciando scheduler...')

  // Executar a cada minuto
  cronJob = setInterval(async () => {
    try {
      const now = new Date()
      const timeStr = now.toLocaleTimeString('pt-BR')
      
      console.log(`[CRON Scheduler] ⏰ Executando às ${timeStr}`)

      const baseUrl = process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000'
      const cronSecret = process.env.CRON_SECRET || 'kros-cron-secret-123'

      const response = await fetch(`${baseUrl}/api/cron/billing-scheduled`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`[CRON Scheduler] ✅ Sucesso:`, {
          enviadas: result.sent_count,
          falhadas: result.failed_count,
          processadas: result.processed_count,
          tempo: `${result.execution_time_ms}ms`
        })
      } else {
        const errorText = await response.text()
        console.error(`[CRON Scheduler] ❌ Erro ${response.status}:`, errorText)
      }
    } catch (err: any) {
      console.error('[CRON Scheduler] ❌ Erro ao executar:', err.message)
    }
  }, 60000) // 60000ms = 1 minuto

  console.log('[CRON Scheduler] ✅ Scheduler iniciado (executa a cada minuto)')
}

export function stopCronScheduler() {
  if (cronJob) {
    clearInterval(cronJob)
    cronJob = null
    console.log('[CRON Scheduler] ⏹️ Parado')
  }
}
