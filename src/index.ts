import { defineExtension } from 'reactive-vscode'
import * as vscode from 'vscode'
import { getConfig } from './config'

import * as meta from './generated/meta'
import { getWebviewContent } from './webviewContent'

const { activate, deactivate } = defineExtension((context) => {
  const disposable = vscode.commands.registerCommand(meta.commands.jsonPreviewShowPreview, async () => {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found.')
      return
    }

    const selection = editor.selection
    const selectedText = editor.document.getText(selection)

    let json
    try {
      json = JSON.parse(selectedText)
    }
    catch {
      vscode.window.showErrorMessage('Selected text is not valid JSON.')
      return
    }

    if (getConfig('jsonPreview.useWebview')) {
      const panel = vscode.window.createWebviewPanel(
        'jsonPreview',
        'JSON Preview',
        vscode.ViewColumn.One,
        { enableScripts: true },
      )

      panel.webview.html = getWebviewContent(json)
    }
    else {
      const document = await vscode.workspace.openTextDocument({ language: 'jsonc', content: JSON.stringify(json, null, 2) })
      await vscode.window.showTextDocument(document)
    }

    // move to new window
    if (getConfig('jsonPreview.moveToNewWindow')) {
      vscode.commands.executeCommand('workbench.action.moveEditorToNewWindow')
    }
  })

  context.subscriptions.push(disposable)
})

export { activate, deactivate }
