/**
 * Composable para gerenciar configurações de WhatsApp
 * Permite padronizar o DDI (código de país) de forma flexível
 */

export const useWhatsAppConfig = () => {
  // DDI padrão (55 = Brasil)
  // Pode ser alterado via variáveis de ambiente ou configuração
  const DEFAULT_DDI = '55'

  /**
   * Normaliza um número de WhatsApp adicionando DDI se necessário
   * @param whatsapp - Número de WhatsApp (com ou sem DDI)
   * @param ddi - DDI a usar (padrão: 55)
   * @returns Número normalizado com DDI
   */
  const normalizeWhatsApp = (whatsapp: string, ddi: string = DEFAULT_DDI): string => {
    if (!whatsapp) return ''

    // Remove tudo que não é número
    const numbers = whatsapp.replace(/\D/g, '')

    if (!numbers) return ''

    // Se já começa com DDI, retorna como está
    if (numbers.startsWith(ddi)) {
      return numbers
    }

    // Se começa com outro DDI (1-3 dígitos), retorna como está
    // (assume que é um DDI válido diferente)
    if (numbers.length > 10 && !numbers.startsWith('0')) {
      return numbers
    }

    // Caso contrário, adiciona o DDI padrão
    return ddi + numbers
  }

  /**
   * Formata um número de WhatsApp para exibição
   * @param whatsapp - Número normalizado (com DDI)
   * @returns Número formatado para exibição
   */
  const formatWhatsAppDisplay = (whatsapp: string): string => {
    if (!whatsapp) return ''

    const numbers = whatsapp.replace(/\D/g, '')

    // Se tem 13 dígitos (55 + 11 dígitos brasileiros)
    if (numbers.length === 13 && numbers.startsWith('55')) {
      const ddi = numbers.slice(0, 2)
      const areaCode = numbers.slice(2, 4)
      const firstPart = numbers.slice(4, 9)
      const secondPart = numbers.slice(9)
      return `+${ddi} (${areaCode}) ${firstPart}-${secondPart}`
    }

    // Se tem 11 dígitos (sem DDI, formato brasileiro)
    if (numbers.length === 11) {
      const areaCode = numbers.slice(0, 2)
      const firstPart = numbers.slice(2, 7)
      const secondPart = numbers.slice(7)
      return `(${areaCode}) ${firstPart}-${secondPart}`
    }

    // Formato genérico
    return numbers
  }

  return {
    DEFAULT_DDI,
    normalizeWhatsApp,
    formatWhatsAppDisplay
  }
}
