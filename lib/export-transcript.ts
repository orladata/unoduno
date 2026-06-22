import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx'

export interface TranscriptData {
  title: string
  content: string
  timestamp?: string
  sourceUrl?: string
}

/**
 * Export transcript as TXT file
 */
export function exportAsTxt(data: TranscriptData) {
  const text = `
${data.title}
${'='.repeat(data.title.length)}

${data.timestamp ? `Generated: ${data.timestamp}` : ''}
${data.sourceUrl ? `Source: ${data.sourceUrl}` : ''}

---

${data.content}
  `.trim()

  downloadFile(text, `${sanitizeFilename(data.title)}.txt`, 'text/plain')
}

/**
 * Export transcript as Markdown file
 */
export function exportAsMarkdown(data: TranscriptData) {
  const markdown = `# ${data.title}

${data.timestamp ? `_Generated: ${data.timestamp}_` : ''}
${data.sourceUrl ? `[Source](${data.sourceUrl})` : ''}

---

${data.content}
  `.trim()

  downloadFile(markdown, `${sanitizeFilename(data.title)}.md`, 'text/markdown')
}

/**
 * Export transcript as PDF
 */
export function exportAsPdf(data: TranscriptData) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margins = { top: 15, left: 15, right: 15, bottom: 15 }
  const lineHeight = 7
  let yPosition = margins.top

  // Add title
  pdf.setFontSize(18)
  pdf.setFont('Helvetica', 'bold')
  const titleLines = pdf.splitTextToSize(data.title, pageWidth - margins.left - margins.right)
  titleLines.forEach((line: string) => {
    if (yPosition > pageHeight - margins.bottom) {
      pdf.addPage()
      yPosition = margins.top
    }
    pdf.text(line, margins.left, yPosition)
    yPosition += lineHeight + 2
  })

  // Add metadata
  pdf.setFontSize(9)
  pdf.setFont('Helvetica', 'normal')
  pdf.setTextColor(100)

  if (data.timestamp) {
    pdf.text(`Generated: ${data.timestamp}`, margins.left, yPosition)
    yPosition += lineHeight
  }

  if (data.sourceUrl) {
    const urlText = `Source: ${data.sourceUrl}`
    pdf.text(urlText, margins.left, yPosition)
    yPosition += lineHeight
  }

  yPosition += 5

  // Add content
  pdf.setTextColor(0)
  pdf.setFontSize(11)
  const contentLines = pdf.splitTextToSize(data.content, pageWidth - margins.left - margins.right)

  contentLines.forEach((line: string) => {
    if (yPosition > pageHeight - margins.bottom) {
      pdf.addPage()
      yPosition = margins.top
    }
    pdf.text(line, margins.left, yPosition)
    yPosition += lineHeight
  })

  // Download
  pdf.save(`${sanitizeFilename(data.title)}.pdf`)
}

/**
 * Export transcript as DOCX (Word document)
 */
export async function exportAsDocx(data: TranscriptData) {
  const sections = [
    new Paragraph({
      text: data.title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    }),
  ]

  if (data.timestamp || data.sourceUrl) {
    const metaText: (TextRun | string)[] = []
    if (data.timestamp) metaText.push(new TextRun(`Generated: ${data.timestamp}`))
    if (data.timestamp && data.sourceUrl) metaText.push(new TextRun('\n'))
    if (data.sourceUrl) metaText.push(new TextRun(`Source: ${data.sourceUrl}`))

    sections.push(
      new Paragraph({
        children: metaText as any,
        spacing: { after: 200 },
      })
    )
  }

  sections.push(
    new Paragraph({
      text: data.content,
      spacing: { line: 360, after: 200 },
    })
  )

  const doc = new Document({
    sections: [
      {
        children: sections,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeFilename(data.title)}.docx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export transcript as SRT (subtitle file)
 */
export function exportAsSrt(data: TranscriptData, timecodes?: Array<{ start: string; end: string; text: string }>) {
  let srtContent = ''

  if (timecodes && timecodes.length > 0) {
    timecodes.forEach((item, index) => {
      srtContent += `${index + 1}\n`
      srtContent += `${item.start} --> ${item.end}\n`
      srtContent += `${item.text}\n\n`
    })
  } else {
    // Fallback: split content into chunks
    const lines = data.content.split('\n').filter((l) => l.trim())
    const chunkSize = 5
    let index = 1

    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunk = lines.slice(i, i + chunkSize).join(' ')
      srtContent += `${index}\n`
      srtContent += `00:${String(i * 2).padStart(2, '0')}:00 --> 00:${String(i * 2 + 2).padStart(2, '0')}:00\n`
      srtContent += `${chunk}\n\n`
      index++
    }
  }

  downloadFile(srtContent.trim(), `${sanitizeFilename(data.title)}.srt`, 'text/plain')
}

/**
 * Helper: Download file
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Helper: Sanitize filename
 */
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
}
