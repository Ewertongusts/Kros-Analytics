/**
 * Job de CRON para cobrança automática
 * Executa a cada minuto via Trigger.dev
 */

import { client } from '@trigger.dev/sdk/v3'

client.defineJob({
  id: 'billing-scheduled-cron',
  name: 'Billing Scheduled CRON',
  version: '1.0.0',
  trigger: {
    type: 'interval',
    options: {
      period: 60, // 60 segundos = 1 minuto
    },
  },
  run: async (payload, io, ctx) => {
    console.log('[Trigger.dev] Executando billing-scheduled-cron')

    try {
      const response = await io.runTask(
        'call-billing-scheduled',
        async () => {
          return await fetch(
            `${process.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/cron/billing-scheduled`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${process.env.CRON_SECRET || 'kros-cron-secret-123'}`,
                'Content-Type': 'application/json',
              },
            }
          )
        },
        {
          name: 'Call Billing Scheduled API',
          retry: {
            maxAttempts: 3,
            minWaitTime: 5,
            maxWaitTime: 60,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`API retornou ${response.status}`)
      }

      const result = await response.json()

      await io.logger.info('Billing CRON executado com sucesso', {
        sent: result.sent_count,
        failed: result.failed_count,
        processed: result.processed_count,
      })

      return {
        success: true,
        ...result,
      }
    } catch (error: any) {
      await io.logger.error('Erro ao executar billing CRON', {
        error: error.message,
      })

      throw error
    }
  },
})
