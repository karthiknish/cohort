import { jsPDF } from 'jspdf';
import { normalizeNotesSummary, stripMarkdownFence } from '@/lib/meeting-notes-ai';
const PAGE_MARGIN_PT = 54;
const HEADING_FONT_SIZE = 13;
const BODY_FONT_SIZE = 11;
const TITLE_FONT_SIZE = 16;
const HEADING_LINE_HEIGHT = 16;
const BODY_LINE_HEIGHT = 14;
const SECTION_GAP = 8;
export type MeetingNotesPdfOptions = {
    meetingTitle: string;
    content: string;
};
type PdfBlock = {
    type: 'title';
    text: string;
} | {
    type: 'heading';
    text: string;
} | {
    type: 'bullet';
    text: string;
} | {
    type: 'paragraph';
    text: string;
};
export function parseMeetingNotesMarkdown(content: string): PdfBlock[] {
    const normalized = normalizeNotesSummary(stripMarkdownFence(content));
    if (!normalized) {
        return [];
    }
    const blocks: PdfBlock[] = [];
    for (const line of normalized.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) {
            continue;
        }
        if (trimmed.startsWith('## ')) {
            blocks.push({ type: 'heading', text: trimmed.slice(3).trim() });
            continue;
        }
        if (trimmed.startsWith('# ')) {
            blocks.push({ type: 'heading', text: trimmed.slice(2).trim() });
            continue;
        }
        const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
        const bulletText = bulletMatch?.[1]?.trim();
        if (bulletText) {
            blocks.push({ type: 'bullet', text: bulletText });
            continue;
        }
        blocks.push({ type: 'paragraph', text: trimmed });
    }
    return blocks;
}
export function renderMeetingNotesPdf({ meetingTitle, content }: MeetingNotesPdfOptions): jsPDF {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - PAGE_MARGIN_PT * 2;
    let y = PAGE_MARGIN_PT;
    const ensureSpace = (height: number) => {
        if (y + height > pageHeight - PAGE_MARGIN_PT) {
            doc.addPage();
            y = PAGE_MARGIN_PT;
        }
    };
    const writeLines = (lines: string[], x: number, lineHeight: number) => {
        for (const line of lines) {
            ensureSpace(lineHeight);
            doc.text(line, x, y);
            y += lineHeight;
        }
    };
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(TITLE_FONT_SIZE);
    const titleLines = doc.splitTextToSize(meetingTitle.trim() || 'Meeting notes', maxWidth);
    writeLines(titleLines, PAGE_MARGIN_PT, HEADING_LINE_HEIGHT + 2);
    y += SECTION_GAP;
    doc.setDrawColor(200);
    doc.line(PAGE_MARGIN_PT, y, pageWidth - PAGE_MARGIN_PT, y);
    y += SECTION_GAP;
    const blocks = parseMeetingNotesMarkdown(content);
    if (blocks.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(BODY_FONT_SIZE);
        writeLines(['No meeting notes content.'], PAGE_MARGIN_PT, BODY_LINE_HEIGHT);
        return doc;
    }
    for (const block of blocks) {
        if (block.type === 'heading') {
            y += 4;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(HEADING_FONT_SIZE);
            const lines = doc.splitTextToSize(block.text, maxWidth);
            writeLines(lines, PAGE_MARGIN_PT, HEADING_LINE_HEIGHT);
            y += 2;
            continue;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(BODY_FONT_SIZE);
        if (block.type === 'bullet') {
            const lines = doc.splitTextToSize(block.text, maxWidth - 14);
            for (const line of lines) {
                ensureSpace(BODY_LINE_HEIGHT);
                doc.text(line === lines[0] ? `• ${line}` : `  ${line}`, PAGE_MARGIN_PT + 6, y);
                y += BODY_LINE_HEIGHT;
            }
            continue;
        }
        const lines = doc.splitTextToSize(block.text, maxWidth);
        writeLines(lines, PAGE_MARGIN_PT, BODY_LINE_HEIGHT);
    }
    return doc;
}
export function buildMeetingNotesPdfArrayBuffer(options: MeetingNotesPdfOptions): ArrayBuffer {
    const doc = renderMeetingNotesPdf(options);
    return doc.output('arraybuffer') as ArrayBuffer;
}
export function buildMeetingNotesPdfBytes(options: MeetingNotesPdfOptions): Uint8Array {
    return new Uint8Array(buildMeetingNotesPdfArrayBuffer(options));
}
export function buildMeetingNotesPdfBlob(options: MeetingNotesPdfOptions): Blob {
    return new Blob([buildMeetingNotesPdfArrayBuffer(options)], { type: 'application/pdf' });
}
export function isPdfBytes(bytes: Uint8Array): boolean {
    return bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}
