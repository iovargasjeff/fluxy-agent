import { CloudConnectionProfileDto } from '../common/cloud-safe.dto';

export class CreateProjectDto {
  name!: string;
  description?: string;
  tags?: string[];
}

export class ProjectDto {
  id!: string;
  name!: string;
  description?: string;
  tags!: string[];
  connectionProfiles!: CloudConnectionProfileDto[];
  createdAt!: string;
  updatedAt!: string;
}

