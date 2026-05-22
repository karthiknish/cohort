import { describe, expect, it } from 'vitest'

import {
  buildTaskImportFileName,
  combineExtractedDocumentText,
  filterTasksDocumentFiles,
  isTasksDocumentFile,
  isTasksVisualDocumentFile,
} from './extract-document-text'

describe('isTasksDocumentFile', () => {
  it('accepts pdf, word, and image files by extension and mime type', () => {
    expect(isTasksDocumentFile(new File([''], 'notes.pdf', { type: 'application/pdf' }))).toBe(true)
    expect(
      isTasksDocumentFile(
        new File([''], 'brief.docx', {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
      ),
    ).toBe(true)
    expect(isTasksDocumentFile(new File([''], 'notes.doc', { type: 'application/msword' }))).toBe(true)
    expect(isTasksDocumentFile(new File([''], 'whiteboard.jpg', { type: 'image/jpeg' }))).toBe(true)
    expect(isTasksDocumentFile(new File([''], 'notes.heic', { type: 'image/heic' }))).toBe(true)
  })

  it('rejects unsupported files', () => {
    expect(isTasksDocumentFile(new File([''], 'archive.zip', { type: 'application/zip' }))).toBe(false)
  })
})

describe('isTasksVisualDocumentFile', () => {
  it('detects image uploads used for handwritten notes', () => {
    expect(isTasksVisualDocumentFile(new File([''], 'scan.png', { type: 'image/png' }))).toBe(true)
    expect(isTasksVisualDocumentFile(new File([''], 'notes.pdf', { type: 'application/pdf' }))).toBe(false)
  })
})

describe('filterTasksDocumentFiles', () => {
  it('keeps supported document and image files', () => {
    const files = [
      new File([''], 'a.pdf', { type: 'application/pdf' }),
      new File([''], 'b.png', { type: 'image/png' }),
      new File([''], 'c.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
      new File([''], 'd.zip', { type: 'application/zip' }),
    ]

    const filtered = filterTasksDocumentFiles(files)
    expect(filtered.map((file) => file.name)).toEqual(['a.pdf', 'b.png', 'c.docx'])
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

describe('buildTaskImportFileName', () => {
  it('uses a single file name or a count summary', () => {
    expect(buildTaskImportFileName([new File([''], 'notes.pdf')])).toBe('notes.pdf')
    expect(
      buildTaskImportFileName([
        new File([''], 'a.pdf'),
        new File([''], 'b.png'),
      ]),
    ).toBe('2 documents')
  })
})
