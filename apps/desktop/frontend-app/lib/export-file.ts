type ExportContent = string | Uint8Array

function downloadInBrowser(content: ExportContent, fileName: string, mimeType: string) {
  const blob = new Blob([content as BlobPart], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function dataUrlToBytes(dataUrl: string) {
  const encoded = dataUrl.split(',', 2)[1] ?? ''
  const binary = window.atob(encoded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export function dataUrlToText(dataUrl: string) {
  const [metadata, encoded = ''] = dataUrl.split(',', 2)
  return metadata.includes(';base64')
    ? new TextDecoder().decode(dataUrlToBytes(dataUrl))
    : decodeURIComponent(encoded)
}

export async function saveExportFile(
  content: ExportContent,
  fileName: string,
  mimeType: string,
  extension: string,
) {
  try {
    const [{ save }, { writeFile }] = await Promise.all([
      import('@tauri-apps/plugin-dialog'),
      import('@tauri-apps/plugin-fs'),
    ])
    const path = await save({
      defaultPath: fileName,
      filters: [{ name: extension.toUpperCase(), extensions: [extension] }],
    })
    if (!path) return false
    const bytes = typeof content === 'string' ? new TextEncoder().encode(content) : content
    await writeFile(path, bytes)
    return true
  } catch {
    downloadInBrowser(content, fileName, mimeType)
    return true
  }
}
