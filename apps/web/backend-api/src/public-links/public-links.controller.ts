import { Body, Controller, Get, Param, Post } from '@nestjs/common';

interface CreatePublicLinkBody {
  diagramId: string;
  shareAccess: 'view' | 'comment';
}

@Controller('public-links')
export class PublicLinksController {
  @Post()
  createPublicLink(@Body() body: CreatePublicLinkBody) {
    return {
      id: crypto.randomUUID(),
      token: crypto.randomUUID(),
      ...body,
      createdAt: new Date().toISOString(),
    };
  }

  @Get(':token')
  getPublicLink(@Param('token') token: string) {
    return {
      token,
      diagram: null,
    };
  }
}

