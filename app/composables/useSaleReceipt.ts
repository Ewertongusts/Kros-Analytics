import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export const useSaleReceipt = () => {
  const { success, error: showError } = useToast()

  const generateReceiptCard = (sale: any): HTMLElement => {
    const card = document.createElement('div')
    card.style.cssText = `
      width: 800px;
      padding: 0;
      background: white;
      font-family: 'Courier New', monospace;
      color: #000;
      position: absolute;
      left: -9999px;
    `

    const saleType = sale.sale_type === 'produto' ? 'PRODUTO' : sale.sale_type === 'servico' ? 'SERVIÇO' : 'PERSONALIZADO'
    const itemName = sale.plan_name || sale.custom_name || 'N/A'
    const clientName = sale.representative_name || sale.name || 'N/A'
    const whatsapp = sale.whatsapp || 'N/A'
    const value = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.monthly_price || 0)
    const finalValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.final_value || sale.monthly_price || 0)
    const paymentType = sale.payment_type || 'N/A'
    const status = sale.payment_status === 'paid' ? 'PAGO' : sale.payment_status === 'pending' ? 'PENDENTE' : 'AGENDADO'
    const createdBy = sale.created_by_name || 'N/A'
    const receivedBy = sale.received_by_name || 'N/A'
    const installments = sale.installments || 1
    const downPayment = sale.down_payment ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.down_payment) : null
    const discount = sale.discount_value ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(sale.discount_value) : null
    const createdAt = new Date(sale.created_at).toLocaleString('pt-BR')
    const paymentDate = sale.payment_date ? new Date(sale.payment_date).toLocaleDateString('pt-BR') : 'N/A'

    card.innerHTML = `
      <div style="border: 3px solid #000; padding: 40px;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 2px dashed #000; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="font-size: 32px; font-weight: 900; margin: 0 0 8px 0; letter-spacing: 2px;">KROS FINANÇAS</h1>
          <p style="font-size: 14px; margin: 0; letter-spacing: 3px;">COMPROVANTE DE VENDA</p>
          <p style="font-size: 11px; margin: 8px 0 0 0; color: #666;">Nº ${sale.id || '---'}</p>
        </div>

        <!-- Tipo de Venda -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; border: 2px solid #000; padding: 8px 24px;">
            <p style="font-size: 16px; font-weight: 900; margin: 0; letter-spacing: 2px;">${saleType}</p>
          </div>
        </div>

        <!-- Dados do Cliente -->
        <div style="margin-bottom: 25px;">
          <p style="font-size: 12px; font-weight: 900; margin: 0 0 10px 0; letter-spacing: 1px;">DADOS DO CLIENTE:</p>
          <div style="border: 1px solid #000; padding: 15px;">
            <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Nome:</strong> ${clientName}</p>
            <p style="margin: 0; font-size: 13px;"><strong>WhatsApp:</strong> ${whatsapp}</p>
          </div>
        </div>

        <!-- Item/Produto -->
        <div style="margin-bottom: 25px;">
          <p style="font-size: 12px; font-weight: 900; margin: 0 0 10px 0; letter-spacing: 1px;">DESCRIÇÃO:</p>
          <div style="border: 1px solid #000; padding: 15px;">
            <p style="margin: 0; font-size: 14px; font-weight: 700;">${itemName}</p>
          </div>
        </div>

        <!-- Valores -->
        <div style="margin-bottom: 25px;">
          <p style="font-size: 12px; font-weight: 900; margin: 0 0 10px 0; letter-spacing: 1px;">VALORES:</p>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #000;">
            <tr style="border-bottom: 1px solid #000;">
              <td style="padding: 12px; border-right: 1px solid #000; font-size: 12px; font-weight: 700;">Valor Original:</td>
              <td style="padding: 12px; text-align: right; font-size: 13px;">${value}</td>
            </tr>
            ${discount ? `
            <tr style="border-bottom: 1px solid #000;">
              <td style="padding: 12px; border-right: 1px solid #000; font-size: 12px; font-weight: 700;">Desconto:</td>
              <td style="padding: 12px; text-align: right; font-size: 13px; color: #d00;">- ${discount}</td>
            </tr>
            ` : ''}
            <tr style="background: #f0f0f0;">
              <td style="padding: 12px; border-right: 1px solid #000; font-size: 13px; font-weight: 900;">VALOR FINAL:</td>
              <td style="padding: 12px; text-align: right; font-size: 16px; font-weight: 900;">${finalValue}</td>
            </tr>
          </table>
        </div>

        <!-- Pagamento -->
        <div style="margin-bottom: 25px;">
          <p style="font-size: 12px; font-weight: 900; margin: 0 0 10px 0; letter-spacing: 1px;">FORMA DE PAGAMENTO:</p>
          <div style="border: 1px solid #000; padding: 15px;">
            <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Tipo:</strong> ${paymentType}</p>
            <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Parcelas:</strong> ${installments}x</p>
            ${downPayment ? `<p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Entrada:</strong> ${downPayment}</p>` : ''}
            <p style="margin: 0 0 8px 0; font-size: 13px;"><strong>Status:</strong> ${status}</p>
            ${paymentDate !== 'N/A' ? `<p style="margin: 0; font-size: 13px;"><strong>Data Pagamento:</strong> ${paymentDate}</p>` : ''}
          </div>
        </div>

        <!-- Responsáveis -->
        <div style="margin-bottom: 30px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="border: 1px solid #000; padding: 15px;">
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 900;">VENDEDOR:</p>
              <p style="margin: 0; font-size: 13px;">${createdBy}</p>
            </div>
            <div style="border: 1px solid #000; padding: 15px;">
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 900;">RECEBEDOR:</p>
              <p style="margin: 0; font-size: 13px;">${receivedBy}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="border-top: 2px dashed #000; padding-top: 20px; text-align: center;">
          <p style="font-size: 10px; margin: 0 0 5px 0; color: #666;">Emitido em: ${createdAt}</p>
          <p style="font-size: 10px; margin: 0; color: #666;">Este documento é um comprovante de venda</p>
        </div>
      </div>
    `

    return card
  }

  const exportAsImage = async (sale: any) => {
    try {
      const card = generateReceiptCard(sale)
      document.body.appendChild(card)

      const canvas = await html2canvas(card, {
        backgroundColor: '#ffffff',
        scale: 1.5, // Reduzido de 2 para 1.5
        logging: false,
        width: 800,
        height: card.offsetHeight
      })

      document.body.removeChild(card)

      // Converte para blob com qualidade reduzida
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a')
          link.download = `comprovante_${sale.representative_name || sale.name}_${Date.now()}.png`
          link.href = URL.createObjectURL(blob)
          link.click()
          URL.revokeObjectURL(link.href)
          success('Comprovante gerado', 'Imagem exportada com sucesso')
        }
      }, 'image/jpeg', 0.85) // JPEG com 85% de qualidade ao invés de PNG
    } catch (err) {
      console.error('Erro ao gerar imagem:', err)
      showError('Erro ao exportar', 'Não foi possível gerar a imagem')
    }
  }

  const exportAsPDF = async (sale: any) => {
    try {
      const card = generateReceiptCard(sale)
      document.body.appendChild(card)

      const canvas = await html2canvas(card, {
        backgroundColor: '#ffffff',
        scale: 1.5, // Reduzido de 2 para 1.5
        logging: false,
        width: 800,
        height: card.offsetHeight
      })

      document.body.removeChild(card)

      const imgData = canvas.toDataURL('image/jpeg', 0.85) // JPEG com 85% de qualidade
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST') // Compressão FAST
      pdf.save(`comprovante_${sale.representative_name || sale.name}_${Date.now()}.pdf`)

      success('Comprovante gerado', 'PDF exportado com sucesso')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      showError('Erro ao exportar', 'Não foi possível gerar o PDF')
    }
  }

  const generateReceiptBlob = async (sale: any): Promise<Blob> => {
    const card = generateReceiptCard(sale)
    document.body.appendChild(card)

    const canvas = await html2canvas(card, {
      backgroundColor: '#ffffff',
      scale: 1.5, // Reduzido de 2 para 1.5
      logging: false,
      width: 800,
      height: card.offsetHeight
    })

    document.body.removeChild(card)

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Falha ao gerar blob'))
        }
      }, 'image/jpeg', 0.85) // JPEG com 85% de qualidade
    })
  }

  return {
    exportAsImage,
    exportAsPDF,
    generateReceiptBlob
  }
}
