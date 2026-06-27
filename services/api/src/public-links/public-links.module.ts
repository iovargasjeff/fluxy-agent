import { Module } from '@nestjs/common';
import { PublicLinksController } from './public-links.controller';

@Module({
  controllers: [PublicLinksController],
})
export class PublicLinksModule {}

