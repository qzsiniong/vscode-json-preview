import { defineExtension } from 'reactive-vscode'
import * as vscode from 'vscode'
import { getConfig } from './config'

import * as meta from './generated/meta'
import { toMarkdownString } from './utils'
import { getWebviewContent } from './webviewContent'

const { activate, deactivate } = defineExtension((context) => {
  let disposable = vscode.languages.registerHoverProvider('*', {
    provideHover(document, position) {
      const selection = vscode.window.activeTextEditor?.selection
      if (!selection?.contains(position)) {
        return null
      }
      const selectedText = document.getText(selection)
      // Encode the command arguments
      const encodedArgs = encodeURIComponent(JSON.stringify({ text: selectedText }))
      const md = toMarkdownString(selectedText, { text: 'view in new window', link: `command:${meta.commands.jsonPreviewShowPreview}?${encodedArgs}` })
      if (!md) {
        return null
      }

      return new vscode.Hover(md)
    },
  })
  context.subscriptions.push(disposable)

  disposable = vscode.commands.registerCommand(meta.commands.jsonPreviewShowPreview, async (args: { text: string } | undefined = undefined) => {
    const editor = vscode.window.activeTextEditor

    let text = args?.text || ''

    if (!text && editor) {
      const selection = editor.selection
      text = editor.document.getText(selection)
    }

    let json
    try {
      json = JSON.parse(text)
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
