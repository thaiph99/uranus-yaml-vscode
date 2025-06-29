import * as vscode from 'vscode';
import { WorkflowTemplateLocation } from '../types';

interface WorkspaceCache {
  templates: Map<string, WorkflowTemplateLocation[]>;
  lastScanned: number;
  fileHashes: Map<string, string>;
}

/**
 * Workspace-level caching service for template definitions.
 * Provides intelligent caching and invalidation based on file changes.
 */
export class WorkspaceCacheService {
  private cache: WorkspaceCache | null = null;
  private readonly cacheTimeout = 300000; // 5 minutes
  private fileWatcher: vscode.FileSystemWatcher | null = null;

  constructor() {
    this.setupFileWatcher();
  }

  public getCachedTemplates(): Map<string, WorkflowTemplateLocation[]> | null {
    if (!this.cache || this.isCacheExpired()) {
      return null;
    }
    return this.cache.templates;
  }

  public setCachedTemplates(templates: Map<string, WorkflowTemplateLocation[]>): void {
    this.cache = {
      templates,
      lastScanned: Date.now(),
      fileHashes: new Map()
    };
  }

  public invalidateCache(): void {
    this.cache = null;
  }

  public dispose(): void {
    this.fileWatcher?.dispose();
  }

  private isCacheExpired(): boolean {
    if (!this.cache) return true;
    return (Date.now() - this.cache.lastScanned) > this.cacheTimeout;
  }

  private setupFileWatcher(): void {
    // Watch for YAML file changes to invalidate cache
    this.fileWatcher = vscode.workspace.createFileSystemWatcher(
      '**/*.{yaml,yml}',
      false, // don't ignore creates
      false, // don't ignore changes
      false  // don't ignore deletes
    );

    this.fileWatcher.onDidChange(() => this.invalidateCache());
    this.fileWatcher.onDidCreate(() => this.invalidateCache());
    this.fileWatcher.onDidDelete(() => this.invalidateCache());
  }
}
