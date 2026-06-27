import { Body, Controller, Get, Param, Post } from '@nestjs/common';

interface CreateVersionBody {
  message: string;
  flowJson: unknown;
  sqlContent?: string;
  activeDialect?: string;
}

@Controller('versions')
export class VersionsController {
  @Get('diagram/:diagramId')
  listDiagramVersions(@Param('diagramId') diagramId: string) {
    void diagramId;
    return [];
  }

  @Post('diagram/:diagramId')
  createDiagramVersion(
    @Param('diagramId') diagramId: string,
    @Body() body: CreateVersionBody,
  ) {
    return {
      id: crypto.randomUUID(),
      diagramId,
      versionNumber: 1,
      ...body,
      createdAt: new Date().toISOString(),
    };
  }
}

