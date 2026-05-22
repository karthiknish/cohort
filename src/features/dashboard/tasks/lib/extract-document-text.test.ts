import { describe, expect, it } from 'vitest'

import {
  combineExtractedDocumentText,
  filterTasksDocumentFiles,
  isTasksDocumentFile,
} from './extract-document-text'

describe('isTasksDocumentFile', () => {
  it('accepts pdf and word files by extension and mime type', () => {
    expect(isTasksDocumentFile(new File([''], 'notes.pdf', { type: 'application/pdf' }))).toBe(true)
    expect(
      isTasksDocumentFile(
        new File([''], 'brief.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
      ),
    ).toBe(true)
    expect(isTasksDocumentFile(new File([''], 'notes.doc', { type: 'application/msword' }))).toBe(true)
  })

  it('rejects unsupported files', () => {
    expect(isTasksDocumentFile(new File([''], 'image.png', { type: 'image/png' }))).toBe(false)
  })
})

describe('filterTasksDocumentFiles', () => {
  it('keeps only supported document files', () => {
    const files = [
      new File([''], 'a.pdf', { type: 'application/pdf' }),
      new File([''], 'b.png', { type: 'image/png' }),
      new File([''], 'c.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
    ]

    const filtered = filterTasksDocumentFiles(files)
    expect(filtered.map((file) => file.name)).toEqual(['a.pdf', 'c.docx'])
  })
})

describe('combineExtractedDocumentText', () => {
  it('joins documents with file headers', () => {
    const combined = combineExtractedDocumentText([
      { fileName: 'a.pdf', text: 'First' },
      { fileName: 'b.docx', text: 'Second' },
    ])

    expect(combined).toContain('Document 1: a.pdf')
    expect(combined).toContain('First')
    expect(combined).toContain('Document 2: b.docx')
    expect(combined).toContain('Second')
  })
})
