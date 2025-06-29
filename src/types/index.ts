export interface WorkflowTemplateLocation {
  readonly file: string;
  readonly line: number;
}

export interface TemplateSearchResult {
  readonly templateName: string;
  readonly locations: readonly WorkflowTemplateLocation[];
}
