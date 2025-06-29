# Uranus YAML

A VS Code extension that enables Ctrl+Click navigation to Argo WorkflowTemplate definitions in YAML files.

## Features

- **Go to Definition**: Ctrl+Click on template names to jump to their WorkflowTemplate definitions
- **YAML Support**: Works with `.yaml` and `.yml` files
- **Workspace Search**: Searches across all YAML files in your workspace
- **High Performance**:
  - Parallel file processing for fast searches
  - Intelligent file caching with automatic invalidation
  - Smart directory filtering (ignores node_modules, .git, etc.)
  - Cancellation support for responsive UI

## Usage

1. Open a YAML file containing Argo Workflow definitions
2. Hold Ctrl and click on a template name reference
3. The extension will navigate to the corresponding WorkflowTemplate definition

## Performance

The extension is optimized for large workspaces with:

- **Parallel processing**: Files are processed concurrently
- **Smart caching**: File contents are cached with intelligent invalidation
- **Directory filtering**: Automatically skips irrelevant directories
- **Cancellation support**: Operations can be cancelled if taking too long

## Development

```bash
npm install
npm run compile
```

Press F5 in VS Code to launch a new Extension Development Host window for testing.
