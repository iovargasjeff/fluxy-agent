import { Body, Controller, Get, Param, Post } from '@nestjs/common';

interface CreateCommentBody {
  body: string;
  position?: unknown;
}

@Controller('comments')
export class CommentsController {
  @Get('diagram/:diagramId')
  listDiagramComments(@Param('diagramId') diagramId: string) {
    void diagramId;
    return [];
  }

  @Post('diagram/:diagramId')
  createDiagramComment(
    @Param('diagramId') diagramId: string,
    @Body() body: CreateCommentBody,
  ) {
    return {
      id: crypto.randomUUID(),
      diagramId,
      ...body,
      createdAt: new Date().toISOString(),
    };
  }
}

