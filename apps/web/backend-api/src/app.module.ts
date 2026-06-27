import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CommentsModule } from './comments/comments.module';
import { DiagramsModule } from './diagrams/diagrams.module';
import { ProjectsModule } from './projects/projects.module';
import { PublicLinksModule } from './public-links/public-links.module';
import { UsersModule } from './users/users.module';
import { VersionsModule } from './versions/versions.module';

@Module({
  imports: [
    UsersModule,
    ProjectsModule,
    DiagramsModule,
    VersionsModule,
    CommentsModule,
    PublicLinksModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
