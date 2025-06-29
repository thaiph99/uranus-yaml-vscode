const vscode = require("vscode")
const fs = require("fs")
const path = require("path")

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(
      { language: "yaml" },
      new ArgoTemplateDefinitionProvider()
    )
  )
  vscode.window.showInformationMessage(
    "Argo Template Jump extension activated."
  )
}

class ArgoTemplateDefinitionProvider {
  provideDefinition(document, position, token) {
    const line = document.lineAt(position).text
    const wordRange = document.getWordRangeAtPosition(
      position,
      /"[^"]+"|'[^']+'|\w+/
    )
    if (!wordRange) return
    const refName = document.getText(wordRange).replace(/['"]/g, "")

    if (!line.includes("name")) return
    vscode.window.showInformationMessage(
      `Searching for WorkflowTemplate: ${refName}`
    )

    const workspaceFolders = vscode.workspace.workspaceFolders
    if (!workspaceFolders) return

    const rootPath = workspaceFolders[0].uri.fsPath
    const results = findTemplateDefinition(rootPath, refName)
    if (!results.length) {
      vscode.window.showWarningMessage(
        `WorkflowTemplate '${refName}' not found.`
      )
      return
    }

    vscode.window.showInformationMessage(
      `Found WorkflowTemplate '${refName}' in ${results[0].file}`
    )

    return new vscode.Location(
      vscode.Uri.file(results[0].file),
      new vscode.Position(results[0].line, 0)
    )
  }
}

function findTemplateDefinition(rootPath, templateName) {
  const results = []
  const files = walkSync(rootPath, [])
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split("\n")
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.includes("kind: WorkflowTemplate")) {
        for (let j = i; j < lines.length; j++) {
          if (lines[j].includes("metadata:")) continue
          if (lines[j].includes("name:") && lines[j].includes(templateName)) {
            results.push({ file, line: j })
            break
          }
        }
      }
    }
  }
  return results
}

function walkSync(dir, fileList = []) {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      walkSync(filePath, fileList)
    } else if (file.endsWith(".yaml") || file.endsWith(".yml")) {
      fileList.push(filePath)
    }
  })
  return fileList
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
}
