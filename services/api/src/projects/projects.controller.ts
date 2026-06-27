import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateProjectDto, ProjectDto } from './dto';

const now = () => new Date().toISOString();

@Controller('projects')
export class ProjectsController {
  @Get()
  listProjects(): ProjectDto[] {
    return [];
  }

  @Post()
  createProject(@Body() body: CreateProjectDto): ProjectDto {
    const timestamp = now();

    return {
      id: crypto.randomUUID(),
      name: body.name,
      description: body.description,
      tags: body.tags ?? [],
      connectionProfiles: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  @Get(':projectId')
  getProject(@Param('projectId') projectId: string): ProjectDto {
    const timestamp = now();

    return {
      id: projectId,
      name: 'Untitled Fluxy project',
      tags: [],
      connectionProfiles: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }
}

