import * as vscode from "vscode";
import { TemplateSearchService } from "../services/templateSearchService";

/**
 * Definition provider for Argo WorkflowTemplate references in YAML files.
 * Enables Ctrl+Click navigation to template definitions.
 */
export class ArgoTemplateDefinitionProvider
  implements vscode.DefinitionProvider
{
  constructor(private readonly templateSearchService: TemplateSearchService) {}

  public async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Location | vscode.Location[] | undefined> {
    // Early exit checks
    if (token.isCancellationRequested) {
      return undefined;
    }

    const line = document.lineAt(position).text;
    if (!this.isNameReference(line)) {
      return undefined;
    }

    const templateName = this.extractTemplateName(document, position);
    if (!templateName || templateName.length < 2) {
      return undefined;
    }

    const workspaceFolder = this.getWorkspaceFolder();
    if (!workspaceFolder) {
      return undefined;
    }

    // Check cancellation before expensive operation
    if (token.isCancellationRequested) {
      return undefined;
    }

    try {
      const searchResult =
        await this.templateSearchService.findTemplateDefinition(
          workspaceFolder.uri.fsPath,
          templateName
        );

      // Final cancellation check
      if (token.isCancellationRequested) {
        return undefined;
      }

      if (searchResult.locations.length === 0) {
        // Don't show warning for common cases to avoid spam
        if (templateName !== "main" && templateName !== "default") {
          void vscode.window.showWarningMessage(
            `WorkflowTemplate '${templateName}' not found.`
          );
        }
        return undefined;
      }

      // Only show success message if more than one result to avoid spam
      if (searchResult.locations.length > 1) {
        void vscode.window.showInformationMessage(
          `Found ${searchResult.locations.length} WorkflowTemplate definitions for '${templateName}'`
        );
      }

      return searchResult.locations.map(
        (location) =>
          new vscode.Location(
            vscode.Uri.file(location.file),
            new vscode.Position(location.line, 0)
          )
      );
    } catch (error) {
      // Log error but don't show to user unless in development
      console.error("Error finding template definition:", error);
      return undefined;
    }
  }

  private isNameReference(line: string): boolean {
    // Look for template references (templateRef.name or similar patterns)
    return (
      line.includes("name") &&
      (line.includes("templateRef") ||
        line.includes("template:") ||
        line.includes("name:"))
    );
  }

  private extractTemplateName(
    document: vscode.TextDocument,
    position: vscode.Position
  ): string | undefined {
    const wordRange = document.getWordRangeAtPosition(
      position,
      /"[^"]+"|'[^']+'|[\w-]+/
    );

    if (!wordRange) {
      return undefined;
    }

    return document.getText(wordRange).replace(/['"]/g, "");
  }

  private getWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    return workspaceFolders?.[0];
  }
}
