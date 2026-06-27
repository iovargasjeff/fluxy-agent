import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DiagramDto, SaveDiagramDto } from './dto';

const now = () => new Date().toISOString();

@Controller('diagrams')
export class DiagramsController {
  @Get('project/:projectId')
  listProjectDiagrams(@Param('projectId') projectId: string): DiagramDto[] {
    void projectId;
    return [];
  }

  @Post()
  saveDiagram(@Body() body: SaveDiagramDto): DiagramDto {
    const timestamp = now();

    return {
      ...body,
      id: crypto.randomUUID(),
      isPublic: false,
      shareAccess: 'view',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }
}

