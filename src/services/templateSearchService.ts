import { WorkflowTemplateLocation, TemplateSearchResult } from "../types";
import { FileSystemService } from "./fileSystemService";

interface CachedFileContent {
  content: string;
  timestamp: number;
}

/**
 * Service responsible for searching WorkflowTemplate definitions across YAML files.
 * Optimized with parallel processing and file content caching.
 */
export class TemplateSearchService {
  private readonly fileCache = new Map<string, CachedFileContent>();
  private readonly cacheTimeout = 30000; // 30 seconds
  private readonly maxConcurrency = 10; // Limit concurrent file operations

  constructor(private readonly fileSystemService: FileSystemService) {}

  public async findTemplateDefinition(
    rootPath: string,
    templateName: string
  ): Promise<TemplateSearchResult> {
    const yamlFiles = await this.fileSystemService.findYamlFiles(rootPath);

    // Process files in parallel with concurrency control
    const locations = await this.searchInFilesParallel(yamlFiles, templateName);

    return {
      templateName,
      locations: locations.flat(),
    };
  }

  private async searchInFilesParallel(
    files: string[],
    templateName: string
  ): Promise<WorkflowTemplateLocation[][]> {
    const promises: Promise<WorkflowTemplateLocation[]>[] = [];

    for (let i = 0; i < files.length; i += this.maxConcurrency) {
      const batch = files.slice(i, i + this.maxConcurrency);
      const batchPromises = batch.map((file) =>
        this.searchInFile(file, templateName)
      );
      promises.push(...batchPromises);
    }

    return Promise.all(promises);
  }

  private async searchInFile(
    filePath: string,
    templateName: string
  ): Promise<WorkflowTemplateLocation[]> {
    try {
      const content = await this.getCachedFileContent(filePath);
      return this.searchInContent(content, filePath, templateName);
    } catch {
      return [];
    }
  }

  private async getCachedFileContent(filePath: string): Promise<string> {
    const cached = this.fileCache.get(filePath);
    const now = Date.now();

    if (cached && now - cached.timestamp < this.cacheTimeout) {
      return cached.content;
    }

    const content = await this.fileSystemService.readFileContent(filePath);
    this.fileCache.set(filePath, { content, timestamp: now });

    // Clean up old cache entries periodically
    if (this.fileCache.size > 100) {
      this.cleanupCache();
    }

    return content;
  }

  private searchInContent(
    content: string,
    filePath: string,
    templateName: string
  ): WorkflowTemplateLocation[] {
    const lines = content.split("\n");
    const locations: WorkflowTemplateLocation[] = [];

    // Optimize by pre-filtering lines that contain WorkflowTemplate
    const workflowTemplateLines: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (this.isWorkflowTemplateLine(lines[i])) {
        workflowTemplateLines.push(i);
      }
    }

    // Search only around WorkflowTemplate definitions
    for (const startIndex of workflowTemplateLines) {
      const nameLineIndex = this.findTemplateNameLine(
        lines,
        startIndex,
        templateName
      );
      if (nameLineIndex !== -1) {
        locations.push({
          file: filePath,
          line: nameLineIndex,
        });
      }
    }

    return locations;
  }

  private cleanupCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, value] of this.fileCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.fileCache.delete(key));
  }

  private isWorkflowTemplateLine(line: string): boolean {
    return line.includes("kind: WorkflowTemplate");
  }

  private findTemplateNameLine(
    lines: string[],
    startIndex: number,
    templateName: string
  ): number {
    for (let j = startIndex; j < lines.length; j++) {
      const line = lines[j];
      if (
        this.isMetadataSection(lines, j) &&
        this.isTemplateName(line, templateName)
      ) {
        return j;
      }
    }
    return -1;
  }

  private isMetadataSection(lines: string[], currentIndex: number): boolean {
    return currentIndex > 0 && lines[currentIndex - 1].includes("metadata:");
  }

  private isTemplateName(line: string, templateName: string): boolean {
    // Extract the value after "name:" and check for exact match
    const nameMatch = line.match(/name:\s*['"]?([^'"#\s]+)['"]?\s*(?:#.*)?$/);
    if (!nameMatch) {
      return false;
    }

    const extractedName = nameMatch[1];
    return extractedName === templateName;
  }
}
