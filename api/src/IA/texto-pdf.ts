import { PDFParse } from 'pdf-parse';

/** Máximo de páginas lidas: comprovantes têm 1 ou 2. */
const PAGINAS = 3;

/**
 * Texto de um PDF. Retorna string vazia quando o PDF não tem texto
 * (escaneado) ou não pode ser lido; nesse caso quem chama usa a IA.
 */
export async function extrairTextoPdf(arquivo: Buffer): Promise<string> {
  const leitor = new PDFParse({ data: new Uint8Array(arquivo) });
  try {
    const resultado = await leitor.getText({ first: PAGINAS });
    return resultado.text.replace(/^-- \d+ of \d+ --$/gm, '');
  } catch {
    return '';
  } finally {
    await leitor.destroy().catch(() => undefined);
  }
}
