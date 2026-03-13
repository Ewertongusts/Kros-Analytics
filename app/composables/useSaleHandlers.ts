import { ref } from 'vue'

export const useSaleHandlers = () => {
  const { shareViaWhatsApp, copySaleInfo } = useSaleActions()
  const { success } = useToast()
  const { exportSales } = useExport()
  const { exportAsImage, exportAsPDF } = useSaleReceipt()
  const { fetchSales } = useSaleCrud()
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const handleWhatsAppShare = async (sale: any) => {
    await shareViaWhatsApp(sale)
    await fetchSales()
  }

  const handleCopySaleInfo = (sale: any) => {
    copySaleInfo(sale)
  }

  const handleExport = (filteredSales: any[], format: 'xlsx' | 'csv' | 'pdf') => {
    exportSales(filteredSales, format)
    success('Exportação concluída', `Arquivo ${format.toUpperCase()} gerado com sucesso`)
  }

  const handleReceiptExport = async (receiptSale: any, format: 'image' | 'pdf') => {
    if (!receiptSale) return

    if (format === 'image') {
      await exportAsImage(receiptSale)
    } else {
      await exportAsPDF(receiptSale)
    }
  }

  const fetchTimelineHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('sale_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) {
        console.error('Erro ao buscar histórico:', error)
        return []
      }

      // Registrar visualização do histórico
      await supabase.from('sale_history').insert({
        action_type: 'history_viewed',
        description: 'Histórico de vendas visualizado',
        user_id: user.value?.id,
        user_name: user.value?.email?.split('@')[0] || 'Sistema',
        metadata: {
          record_count: data?.length || 0,
          viewed_at: new Date().toISOString()
        }
      })

      return data || []
    } catch (err) {
      console.error('Erro:', err)
      return []
    }
  }

  const logPageAccess = async () => {
    try {
      await supabase.from('sale_history').insert({
        action_type: 'page_accessed',
        description: 'Página de Vendas acessada',
        user_id: user.value?.id,
        user_name: user.value?.email?.split('@')[0] || 'Sistema',
        metadata: {
          page: 'vendas',
          accessed_at: new Date().toISOString()
        }
      })
    } catch (err) {
      console.error('Erro ao registrar acesso:', err)
    }
  }

  return {
    handleWhatsAppShare,
    handleCopySaleInfo,
    handleExport,
    handleReceiptExport,
    fetchTimelineHistory,
    logPageAccess
  }
}
