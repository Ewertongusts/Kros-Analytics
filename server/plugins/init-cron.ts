/**
 * Plugin que inicia o CRON scheduler quando o servidor sobe
 * Apenas em desenvolvimento local
 */

import { initCronScheduler } from '../utils/cron-scheduler'

export default defineNitroPlugin(() => {
  // Apenas iniciar em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('[Init CRON] Iniciando scheduler em modo desenvolvimento...')
    initCronScheduler()
  } else {
    console.log('[Init CRON] Modo produção - use Trigger.dev ou Vercel Cron')
  }
})
