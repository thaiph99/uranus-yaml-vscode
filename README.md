# Uranus YAML - Argo Workflow Template Navigator

A VS Code extension that enables intelligent **Ctrl+Click** navigation for Argo WorkflowTemplate references in YAML files. Navigate seamlessly between template definitions and their usages across your entire workspace.

## ✨ Features

- **🎯 Smart Context-Aware Navigation**: Single Ctrl+Click does different actions based on where you click
- **📍 Go to Definition**: Navigate from template references to their definitions
- **🔍 Find All References**: Show all usages of templates and WorkflowTemplates
- **⚡ High Performance**: Parallel processing, intelligent caching, and smart filtering
- **🎨 Intelligent Disambiguation**: Handles multiple templates with same names correctly
- **🌐 Cross-Resource Support**: Works with Workflows, WorkflowTemplates, CronWorkflows, etc.

## 🚀 How It Works

The extension uses **context-aware navigation** - a single **Ctrl+Click** performs different actions based on what you're clicking on:

### Context 1: Template Reference → Go to Definition

**When**: Ctrl+Click on template references in usage files
**Action**: Navigate to template definition

```yaml
# In workflow.yaml - Ctrl+Click on "step1":
templateRef:
  name: tem-tem1
  template: step1  # ← Ctrl+Click here goes to definition in tem1.yaml
```

### Context 2: Template Definition → Find All References

**When**: Ctrl+Click on template names in WorkflowTemplate definition files
**Action**: Show all references to this template

```yaml
# In tem1.yaml - Ctrl+Click on "step1":
spec:
  templates:
    - name: step1  # ← Ctrl+Click here shows all references
      container:
        image: alpine
```

### Context 3: WorkflowTemplate Name → Find All References

**When**: Ctrl+Click on WorkflowTemplate names in metadata section
**Action**: Show all references to this WorkflowTemplate

```yaml
# In tem1.yaml - Ctrl+Click on "tem-tem1":
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: tem-tem1  # ← Ctrl+Click here shows all WorkflowTemplate references
spec:
  templates:
    - name: step1
```

## 🧪 Testing & Examples

### Example Files Structure

```
test-files/
├── tem1.yaml                    # WorkflowTemplate with step1, step2
├── workflow.yaml                # Workflow referencing tem1
├── multiple-templates.yaml      # Multiple WorkflowTemplates with overlapping names
├── composite-template.yaml      # WorkflowTemplate using other templates
├── cronworkflow.yaml           # CronWorkflow referencing templates
└── ...
```

### Test Cases

#### Test Case 1: Go to Definition

1. Open `workflow.yaml`
2. Ctrl+Click on `step1` in `template: step1`
3. **Expected**: Navigate to `tem1.yaml` line 7 (`- name: step1`)

#### Test Case 2: Find Template References

1. Open `tem1.yaml`
2. Ctrl+Click on `step1` in `- name: step1`
3. **Expected**: Shows references in:
   - `workflow.yaml`
   - `cronworkflow.yaml`
   - `composite-template.yaml`

#### Test Case 3: Find WorkflowTemplate References

1. Open `tem1.yaml`
2. Ctrl+Click on `tem-tem1` in `name: tem-tem1`
3. **Expected**: Shows all WorkflowTemplate references across workspace

#### Test Case 4: Disambiguation

1. Open `complex-workflow.yaml`
2. Multiple WorkflowTemplates have `step1` templates
3. Ctrl+Click correctly uses `templateRef.name` to find the right template

## 🛠️ Development

### Setup

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes during development
npm run watch
```

### Testing the Extension

1. **Launch Extension Development Host**: Press `F5` in VS Code
2. **Open Test Files**: Open the `test-files` folder in the new VS Code window
3. **Test Navigation**: Try Ctrl+Click on different template names and references
4. **Check Console**: Open Developer Tools (Help → Toggle Developer Tools) for debug logs

### Architecture

```
src/
├── extension.ts                 # Extension entry point
├── providers/
│   ├── argoTemplateDefinitionProvider.ts  # Main navigation logic
│   └── argoTemplateReferenceProvider.ts   # Reference provider (backup)
├── services/
│   ├── templateSearchService.ts           # Search logic
│   ├── fileSystemService.ts              # File operations
│   └── workspaceCacheService.ts          # Caching
└── types/
    └── index.ts                          # Type definitions
```

## 🎯 Key Features in Detail

### Smart Context Detection

The extension automatically detects:

- **Template References**: `templateRef.template` usage
- **Template Definitions**: `- name:` in templates section
- **WorkflowTemplate Names**: `metadata.name` in WorkflowTemplate files
- **WorkflowTemplate References**: `templateRef.name` and `workflowTemplateRef.name`

### Performance Optimizations

- **Parallel Processing**: Multiple files processed concurrently
- **Intelligent Caching**: File contents cached with auto-invalidation (30s timeout)
- **Smart Filtering**: Automatically skips irrelevant directories (node_modules, .git, etc.)
- **Cancellation Support**: Long operations can be cancelled for responsive UI

### Disambiguation Logic

When multiple WorkflowTemplates contain templates with the same name:

1. Extension identifies the `templateRef.name` (WorkflowTemplate name)
2. Searches specifically within that WorkflowTemplate
3. Locates the correct template definition
4. Navigates to the exact line

## 📋 Requirements

- VS Code 1.80.0 or higher
- YAML language support (usually built-in)
- Files must be in a workspace folder

## 🐛 Troubleshooting

### Common Issues

**Extension not working?**

- Check that extension is activated (look for "Uranus YAML extension activated" message)
- Ensure you're in a `.yaml` file (check bottom right corner shows "YAML")
- Try clicking directly on the template name, not surrounding whitespace

**No results found?**

- Verify YAML structure is correct (proper indentation)
- Check that WorkflowTemplate and template names match exactly
- Look for typos in template names

**Performance issues?**

- Large workspaces may take longer to search
- Check VS Code Developer Console for error messages
- Try reloading the window (Ctrl+R)

### Debug Mode

1. Open VS Code Developer Console: Help → Toggle Developer Tools → Console tab
2. Look for `ArgoTemplateDefinitionProvider` and `TemplateSearchService` logs
3. Messages show what the extension is detecting and searching for

## 🔄 Version History

### v0.0.1 - Current

- ✅ Context-aware Ctrl+Click navigation
- ✅ Go to Definition for template references
- ✅ Find All References for template definitions
- ✅ Find All References for WorkflowTemplate names
- ✅ Smart disambiguation for same-named templates
- ✅ High-performance parallel search with caching
- ✅ Support for Workflows, WorkflowTemplates, CronWorkflows

## 🤝 Contributing

This extension provides a foundation for Argo Workflow development productivity. The codebase is structured for easy extension and maintenance.

### Key Extension Points

- **New Resource Types**: Add support for other Argo resources
- **Enhanced Search**: Improve search algorithms and filtering
- **UI Improvements**: Add status indicators, progress bars, etc.
- **Additional Features**: Hover information, auto-completion, etc.

---

**Enjoy seamless Argo Workflow development! 🚀**
  templates:
    - name: step1

```

## 📖 Usage

1. **Open** any YAML file containing Argo Workflow definitions
2. **Ctrl+Click** on any template or WorkflowTemplate name
3. **Let the extension decide** what action to take based on context:
   - From references → Navigate to definition
   - From definitions → Show all references

### Example Scenarios

**Navigate to WorkflowTemplate Definition**:
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
spec:
  workflowTemplateRef:
    name: my-template  # Ctrl+Click → Go to WorkflowTemplate
```

**Navigate to Specific Template**:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
spec:
  templates:
    - name: main
      steps:
        - - name: call-step
            templateRef:
              name: tem-tem1
              template: step1  # Ctrl+Click → Go to template definition
```

**Find All References**:

```yaml
# In WorkflowTemplate file
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: tem-tem1      # Ctrl+Click → Show all WorkflowTemplate references
spec:
  templates:
    - name: step1      # Ctrl+Click → Show all template references
      container:
        image: alpine
```

## 🧪 Testing

### Quick Test

1. **Launch Extension**: Press `F5` in VS Code
2. **Open Test Files**: Navigate to `test-files` folder in the new window
3. **Try Navigation**:
   - Open `workflow.yaml` → Ctrl+Click on `step1` → Should navigate to `tem1.yaml`
   - Open `tem1.yaml` → Ctrl+Click on `step1` → Should show references panel
   - Open `tem1.yaml` → Ctrl+Click on `tem-tem1` → Should show WorkflowTemplate references

### Test Files Included

- `tem1.yaml` - Simple WorkflowTemplate with templates
- `workflow.yaml` - Basic workflow using templates
- `cronworkflow.yaml` - Scheduled workflow
- `multiple-templates.yaml` - Multiple WorkflowTemplates with overlapping names
- `composite-template.yaml` - WorkflowTemplate using other templates
- Additional test files for comprehensive coverage

## ⚡ Performance Features

- **Parallel Processing**: Multiple files processed concurrently
- **Intelligent Caching**: File contents cached with auto-invalidation
- **Smart Filtering**: Automatically skips irrelevant directories (node_modules, .git, etc.)
- **Cancellation Support**: Long operations can be cancelled for responsive UI

## 🛠️ Development

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes
npm run watch

# Test extension
# Press F5 in VS Code to launch Extension Development Host
```

## 📋 Requirements

- VS Code 1.80.0 or higher
- YAML files with proper Argo Workflow structure
- Workspace with YAML files containing WorkflowTemplate definitions

## 💡 Tips

- **Context Detection**: The extension automatically detects whether you're clicking on a reference or definition
- **Disambiguation**: When multiple WorkflowTemplates have templates with the same name, the extension uses `templateRef.name` to find the correct one
- **Cross-File Search**: Searches across all YAML files in your workspace
- **Error Handling**: Shows informative messages when templates or references aren't found

## 🏗️ Architecture

- **ArgoTemplateDefinitionProvider**: Main provider handling Ctrl+Click navigation
- **TemplateSearchService**: Core search logic with caching and parallel processing
- **FileSystemService**: File operations and YAML file discovery
- **Smart Context Detection**: Determines appropriate action based on cursor position

---

**Happy Workflow Templating! 🚀**
