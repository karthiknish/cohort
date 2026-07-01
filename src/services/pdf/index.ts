/**
 * PDF generation module — barrel export.
 *
 * File structure:
 *   pdf/
 *   ├── constants.ts       — colors, fonts, page dimensions (mirrors PPTX theme)
 *   └── proposal-pdf.ts   — main generator (jsPDF, landscape 16:9)
 */

export { generateProposalPdf } from './proposal-pdf';
