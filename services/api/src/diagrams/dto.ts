export class SaveDiagramDto {
  projectId!: string;
  name!: string;
  sourceCode?: string;
  dialect?: string;
  flowJson?: unknown;
  mermaidString?: string;
  generatedSql?: string;
}

export class DiagramDto extends SaveDiagramDto {
  id!: string;
  isPublic!: boolean;
  shareAccess!: 'view' | 'comment';
  createdAt!: string;
  updatedAt!: string;
}

