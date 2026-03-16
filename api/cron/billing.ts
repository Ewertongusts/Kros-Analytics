/**
 * Vercel Cron - Executa a cada minuto em produção
 * Configure no vercel.json
 */

import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Validar token
  const authHeader = req.headers.authorization
  const cronSecret = process.env.CRON_SECRET || 'kros-cron-secret-123'

  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    console.log('[Vercel Cron] Executando billing-scheduled')

    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/cron/billing-scheduled`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API retornou ${response.status}`)
    }

    const result = await response.json()

    console.log('[Vercel Cron] ✅ Sucesso:', {
      enviadas: result.sent_count,
      falhadas: result.failed_count,
      processadas: result.processed_count
    })

    return res.status(200).json({
      success: true,
      ...result
    })
  } catch (error: any) {
    console.error('[Vercel Cron] ❌ Erro:', error.message)
    return res.status(500).json({
      error: error.message
    })
  }
}
