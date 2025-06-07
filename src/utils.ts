import { useLogger } from 'reactive-vscode'
import * as vscode from 'vscode'
import { displayName } from './generated/meta'

export const logger = useLogger(displayName)

function formatJSONString(s: string, indent: number): string | null {
  try {
    const json = JSON.parse(s)
    return JSON.stringify(json, null, indent)
  }
  catch {
    return null
  }
}

interface Button {
  text: string
  link: string
}

export function toMarkdownString(s: string, ...buttons: Button[]): vscode.MarkdownString | null {
  const json = formatJSONString(s, 2)
  if (!json) {
    return null
  }

  let content = ''
  buttons.forEach((button) => {
    const buttonMarkdown = `[${button.text}](${button.link})`
    content += `${buttonMarkdown} `
  })

  if (content) {
    content += '\n'
  }

  content += `\`\`\`json\n${json}\n\`\`\``
  const md = new vscode.MarkdownString(content)
  md.supportHtml = true
  md.isTrusted = true
  return md
}
