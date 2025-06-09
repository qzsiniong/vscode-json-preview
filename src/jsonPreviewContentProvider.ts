import * as vscode from 'vscode'

class JsonPreviewTextDocumentContentProvider implements vscode.TextDocumentContentProvider {
  static scheme = 'json-preview'

  private items = new Map<string, string>()

  set(uri: vscode.Uri, contents: string): void {
    this.items.set(uri.path, contents)
  }

  preview(json: any) {
    const timestamp = new Date().getTime()
    const scheme = JsonPreviewTextDocumentContentProvider.scheme
    const uri = vscode.Uri.parse(`${scheme}:/json-preview-${timestamp}.json`)
    const isString = typeof json === 'string'
    const contents = isString ? json : `${JSON.stringify(json, null, 2)}`
    this.set(uri, contents)
    return uri
  }

  delete(uri: vscode.Uri): void {
    this.items.delete(uri.path)
  }

  provideTextDocumentContent(uri: vscode.Uri): string | undefined {
    return this.items.get(uri.path)
  }
}

export function registerJsonPreviewContentProvider(context: vscode.ExtensionContext) {
  const provider = new JsonPreviewTextDocumentContentProvider()
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider('json-preview', provider),
  )

  return {
    parseJsonPreviewUri: (json: any) => {
      return provider.preview(json)
    },
  }
}
