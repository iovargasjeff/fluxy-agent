import { Controller, Get } from '@nestjs/common';
import { CloudSafeArtifactPolicyDto } from './common/cloud-safe.dto';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      product: 'Fluxy',
      service: 'cloud-api',
      version: '0.1.0',
    };
  }

  @Get('policy/cloud-safe-artifacts')
  getCloudSafeArtifactPolicy(): CloudSafeArtifactPolicyDto {
    return new CloudSafeArtifactPolicyDto();
  }
}
