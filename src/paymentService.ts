// src/paymentService.ts
export async function gerarCobrancaPix(dadosPedido: any) {
  try {
    // Simulação de retorno de Pix gerado com sucesso para a vitrine
    return {
      success: true,
      paymentId: "PAY-" + Math.floor(Math.random() * 1000000),
      qrCodeText: "00020126580014br.gov.bcb.pix..." + Math.random(),
      status: "pending"
    };
  } catch (error) {
    return { success: false, error: 'Erro ao gerar Pix.' };
  }
}
