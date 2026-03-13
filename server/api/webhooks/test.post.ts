import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    
    // Criar evento de teste
    const testEvent = {
      event_type: 'customer.created',
      source_system: 'test',
      payload: {
        id: `test_${Date.now()}`,
        name: 'Teste - ' + new Date().toLocaleString('pt-BR'),
        contact_name: 'João Teste',
        email: 'teste@example.com',
        phone: '11987654321',
        source: 'test'
      },
      processed: true,
      received_at: new Date().toISOString()
    }

    // Inserir na tabela
    const { error } = await client.from('webhook_events').insert(testEvent as any)
    
    if (error) {
      console.error('Erro ao criar evento teste:', error)
      throw error
    }

    return {
      success: true,
      message: 'Evento teste criado com sucesso!',
      event: testEvent
    }
  } catch (err: any) {
    console.error('Erro ao processar teste:', err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message
    })
  }
})
