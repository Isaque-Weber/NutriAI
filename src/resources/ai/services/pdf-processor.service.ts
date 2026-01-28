import { Injectable } from '@nestjs/common';
import { log } from '@shared/logging/logger';
import { KnowledgeService } from './knowledge.service';

interface ChunkMetadata {
  source: string;
  chunkIndex: number;
  totalChunks: number;
  [key: string]: any;
}

@Injectable()
export class PdfProcessorService {
  private readonly CHUNK_SIZE = 800;
  private readonly CHUNK_OVERLAP = 100;

  constructor(private readonly knowledgeService: KnowledgeService) {}

  async processPdf(
    buffer: Buffer,
    filename: string,
    additionalMetadata: Record<string, any> = {},
  ): Promise<{ chunksIndexed: number }> {
    try {
      log.info(`[PdfProcessor] Processando PDF: ${filename}`);

      // Extract text from PDF
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(buffer);
      const fullText = pdfData.text;

      if (!fullText || fullText.trim().length === 0) {
        throw new Error('PDF não contém texto extraível');
      }

      log.info(
        `[PdfProcessor] Texto extraído: ${fullText.length} caracteres`,
      );

      // Split into chunks
      const chunks = this.splitIntoChunks(fullText);
      log.info(`[PdfProcessor] Dividido em ${chunks.length} chunks`);

      // Index each chunk
      for (let i = 0; i < chunks.length; i++) {
        const metadata: ChunkMetadata = {
          source: filename,
          chunkIndex: i,
          totalChunks: chunks.length,
          ...additionalMetadata,
        };

        await this.knowledgeService.indexText(chunks[i], metadata);
      }

      log.info(
        `[PdfProcessor] ${chunks.length} chunks indexados com sucesso`,
      );

      return { chunksIndexed: chunks.length };
    } catch (error) {
      log.error(`[PdfProcessor] Erro ao processar PDF:`, error);
      throw error;
    }
  }

  private splitIntoChunks(text: string): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + this.CHUNK_SIZE, text.length);
      const chunk = text.substring(startIndex, endIndex).trim();

      if (chunk.length > 0) {
        chunks.push(chunk);
      }

      // Move forward with overlap
      startIndex += this.CHUNK_SIZE - this.CHUNK_OVERLAP;
    }

    return chunks;
  }
}
