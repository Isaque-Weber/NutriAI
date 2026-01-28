import { Body, Controller, Param, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorators';
import { UserRole } from '@shared/enums/user-role.enum';
import { GenerateReplyUseCase } from '../../app/use-cases/generate-reply.use-case';
import { KnowledgeService } from '../../services/knowledge.service';
import { IndexTextDto } from '../dtos/index-text.dto';
import { PdfProcessorService } from '../../services/pdf-processor.service';

@Controller('ai')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiController {
  constructor(
    private readonly generateReply: GenerateReplyUseCase,
    private readonly knowledgeService: KnowledgeService,
    private readonly pdfProcessor: PdfProcessorService,
  ) {}

  @Roles(UserRole.NUTRITIONIST, UserRole.PATIENT)
  @Post('conversations/:conversationId/reply')
  generate(
    @Param('conversationId') conversationId: string,
    @Body('prompt') prompt: string,
  ) {
    return this.generateReply.execute(conversationId, prompt);
  }

  @Roles(UserRole.NUTRITIONIST)
  @Post('knowledge/index')
  async index(@Body() body: IndexTextDto) {
    await this.knowledgeService.indexText(body.text, body.metadata);
    return { message: 'Texto indexado com sucesso' };
  }

  @Roles(UserRole.NUTRITIONIST)
  @Post('knowledge/upload-pdf')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('metadata') metadataJson?: string,
  ) {
    // Validate file exists
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // Validate PDF mimetype
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Apenas arquivos PDF são aceitos');
    }

    // Parse optional metadata
    let metadata = {};
    if (metadataJson) {
      try {
        metadata = JSON.parse(metadataJson);
      } catch {
        throw new BadRequestException('Metadata inválido (deve ser JSON)');
      }
    }

    const result = await this.pdfProcessor.processPdf(
      file.buffer,
      file.originalname,
      metadata,
    );

    return {
      message: 'PDF processado com sucesso',
      filename: file.originalname,
      ...result,
    };
  }
}
