export type PaperSize = 'A4' | 'A3' | 'Letter';

const PAPER_DIMENSIONS: Record<PaperSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  A3: { width: 297, height: 420 },
  Letter: { width: 215.9, height: 279.4 },
};

const PRINT_PAGE_NAMES: Record<PaperSize, string> = { A4: 'A4', A3: 'A3', Letter: 'letter' };

export interface PrintGridLayout {
  scale: number;
  width: number;
  height: number;
}

export function calculatePrintGridLayout(
  gridWidth: number,
  gridHeight: number,
  paperSize: PaperSize,
): PrintGridLayout {
  const paper = PAPER_DIMENSIONS[paperSize];
  const pixelsPerMillimeter = 96 / 25.4;
  const printableWidth = (paper.width - 20) * pixelsPerMillimeter;
  const printableHeight = (paper.height - 55) * pixelsPerMillimeter;
  const scale = Math.min(1, printableWidth / gridWidth, printableHeight / gridHeight);

  return {
    scale,
    width: Math.ceil(gridWidth * scale),
    height: Math.ceil(gridHeight * scale),
  };
}

export function setPrintPageRule(paperSize: PaperSize): void {
  const styleId = 'crossword-print-page-size';
  const style = document.querySelector<HTMLStyleElement>(`#${styleId}`) ?? document.createElement('style');
  style.id = styleId;
  style.textContent = `@media print { @page { size: ${PRINT_PAGE_NAMES[paperSize]} portrait; margin: 10mm; } }`;
  if (!style.parentElement) document.head.append(style);
}
