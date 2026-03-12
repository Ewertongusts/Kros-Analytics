import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export const useExport = () => {
  const { error: showError } = useToast()
  
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      showError('Nenhum dado', 'Não há dados para exportar')
      return
    }

    const headers = Object.keys(data[0])
    const csvRows = []
    
    csvRows.push(headers.join(','))
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header]
        const escaped = ('' + value).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csvRows.push(values.join(','))
    }
    
    const csvString = csvRows.join('\n')
    const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToXLSX = (data: any[], filename: string, sheetName: string = 'Dados') => {
    if (!data || data.length === 0) {
      showError('Nenhum dado', 'Não há dados para exportar')
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

    const maxWidth = 50
    const colWidths = Object.keys(data[0]).map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      )
      return { wch: Math.min(maxLength + 2, maxWidth) }
    })
    worksheet['!cols'] = colWidths

    XLSX.writeFile(workbook, `${filename}.xlsx`)
  }

  const exportToPDF = (data: any[], filename: string, title: string = 'Relatório') => {
    if (!data || data.length === 0) {
      showError('Nenhum dado', 'Não há dados para exportar')
      return
    }

    const doc = new jsPDF('l', 'mm', 'a4') // landscape, mm, A4
    
    // Título
    doc.setFontSize(16)
    doc.text(title, 14, 15)
    
    // Data de geração
    doc.setFontSize(10)
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 22)
    
    // Preparar dados para tabela
    const headers = Object.keys(data[0])
    const rows = data.map(row => headers.map(header => row[header]))
    
    // Gerar tabela
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 28,
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [59, 130, 246], // azul
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    })
    
    doc.save(`${filename}.pdf`)
  }

  const exportPayments = (payments: any[], format: 'xlsx' | 'csv' | 'pdf') => {
    console.log('📦 useExport: exportPayments chamado com', payments.length, 'pagamentos e formato', format)
    
    const data = payments.map(p => ({
      'Empresa': p.company_name,
      'Plano': p.plan_name,
      'Cadastro': new Date(p.company_created_at).toLocaleDateString('pt-BR'),
      'Vencimento': new Date(p.due_date).toLocaleDateString('pt-BR'),
      'Valor': `R$ ${p.amount.toFixed(2)}`,
      'LTV Pago': `R$ ${p.company_ltv.toFixed(2)}`,
      'Status': p.status,
      'Última Cobrança': p.last_alert_at ? new Date(p.last_alert_at).toLocaleString('pt-BR') : 'Nunca cobrado',
      'WhatsApp': p.company_whatsapp || 'N/A',
      'Representante': p.company_rep || 'N/A',
      'Tags': (p.tags || []).join('; '),
      'Auto Cobrança': p.auto_billing_enabled ? 'Sim' : 'Não'
    }))
    
    const date = new Date().toISOString().split('T')[0]
    const filename = `cobrancas_${date}`
    
    console.log('📦 useExport: Exportando', data.length, 'registros como', format)
    
    switch (format) {
      case 'xlsx':
        exportToXLSX(data, filename, 'Cobranças')
        break
      case 'csv':
        exportToCSV(data, filename)
        break
      case 'pdf':
        exportToPDF(data, filename, 'Relatório de Cobranças')
        break
    }
  }

  const exportSales = (sales: any[], format: 'xlsx' | 'csv' | 'pdf') => {
    console.log('📦 useExport: exportSales chamado com', sales.length, 'vendas e formato', format)
    
    const data = sales.map(s => ({
      'Cliente': s.representative_name || s.name || 'N/A',
      'WhatsApp': s.whatsapp || 'N/A',
      'Tipo': s.sale_type === 'produto' ? 'Produto' : s.sale_type === 'servico' ? 'Serviço' : 'Personalizado',
      'Item': s.sale_type === 'personalizado' ? s.custom_name : s.product_name || s.service_name || 'N/A',
      'Valor Original': `R$ ${(s.monthly_price || 0).toFixed(2)}`,
      'Desconto': s.discount_value ? `R$ ${s.discount_value.toFixed(2)}` : 'Sem desconto',
      'Valor Final': `R$ ${(s.final_value || s.monthly_price || 0).toFixed(2)}`,
      'Parcelas': s.installments || 1,
      'Entrada': s.down_payment ? `R$ ${s.down_payment.toFixed(2)}` : 'Sem entrada',
      'Status Pagamento': s.payment_status === 'paid' ? 'Pago' : s.payment_status === 'pending' ? 'Pendente' : s.payment_status === 'scheduled' ? 'Agendado' : 'Atrasado',
      'Data Pagamento': s.payment_date ? new Date(s.payment_date).toLocaleDateString('pt-BR') : 'N/A',
      'Criado em': new Date(s.created_at).toLocaleDateString('pt-BR'),
      'Criado por': s.created_by_name || 'N/A',
      'Observações': s.notes || 'Sem observações'
    }))
    
    const date = new Date().toISOString().split('T')[0]
    const filename = `vendas_${date}`
    
    console.log('📦 useExport: Exportando', data.length, 'registros como', format)
    
    switch (format) {
      case 'xlsx':
        exportToXLSX(data, filename, 'Vendas')
        break
      case 'csv':
        exportToCSV(data, filename)
        break
      case 'pdf':
        exportToPDF(data, filename, 'Relatório de Vendas')
        break
    }
  }

  return {
    exportToCSV,
    exportToXLSX,
    exportToPDF,
    exportPayments,
    exportSales
  }
}
