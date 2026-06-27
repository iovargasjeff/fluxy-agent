import { Module } from '@nestjs/common';
import { DiagramsController } from './diagrams.controller';

@Module({
  controllers: [DiagramsController],
})
export class DiagramsModule {}

