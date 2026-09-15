export interface ExportPdfOptions {
  filename: string;
  onProgress?: (progress: number, statusText: string) => void;
}

type jsPDFInstance = InstanceType<typeof import('jspdf').default>;

const PAGE_W_MM = 210;
const PAGE_H_MM = 297;
/** CSS px at 96dpi — capture is more reliable with px than mm. */
const PAGE_W_PX = Math.round((PAGE_W_MM * 96) / 25.4);
const PAGE_H_PX = Math.round((PAGE_H_MM * 96) / 25.4);
const PAGE_PAD_PX = Math.round((15 * 96) / 25.4);
const PIXEL_RATIO = 2;

function withPdfExtension(filename: string): string {
  const trimmed = filename.trim() || 'document.pdf';
  return trimmed.toLowerCase().endsWith('.pdf') ? trimmed : `${trimmed}.pdf`;
}

function waitFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
      });
    })
  );
}

function copyCanvasPixels(sourceRoot: HTMLElement, destRoot: HTMLElement): void {
  const srcCanvases = sourceRoot.querySelectorAll('canvas');
  const destCanvases = destRoot.querySelectorAll('canvas');
  srcCanvases.forEach((src, i) => {
    const dest = destCanvases[i];
    if (!dest) return;
    dest.width = src.width;
    dest.height = src.height;
    const ctx = dest.getContext('2d');
    if (ctx) ctx.drawImage(src, 0, 0);
  });
}

function preparePageClone(pageEl: HTMLElement): HTMLElement {
  const clone = pageEl.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.classList.remove('hidden');
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.position = 'relative';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.visibility = 'visible';
  clone.style.display = 'flex';
  clone.style.flexDirection = 'column';
  clone.style.justifyContent = 'space-between';
  clone.style.background = '#ffffff';
  clone.style.overflow = 'hidden';
  clone.style.boxSizing = 'border-box';
  clone.style.width = `${PAGE_W_PX}px`;
  clone.style.minWidth = `${PAGE_W_PX}px`;
  clone.style.maxWidth = `${PAGE_W_PX}px`;
  clone.style.height = `${PAGE_H_PX}px`;
  clone.style.minHeight = `${PAGE_H_PX}px`;
  clone.style.maxHeight = `${PAGE_H_PX}px`;
  clone.style.padding = getComputedStyle(pageEl).padding || `${PAGE_PAD_PX}px`;
  return clone;
}

async function captureA4PageJpeg(pageEl: HTMLElement): Promise<string> {
  const { toJpeg } = await import('html-to-image');

  const host = document.createElement('div');
  host.setAttribute('data-pdf-capture-host', '');
  Object.assign(host.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: `${PAGE_W_PX}px`,
    height: `${PAGE_H_PX}px`,
    overflow: 'hidden',
    background: '#ffffff',
    zIndex: '2147483646',
    pointerEvents: 'none',
    opacity: '1',
  });

  const clone = preparePageClone(pageEl);
  host.appendChild(clone);
  document.body.appendChild(host);

  copyCanvasPixels(pageEl, clone);
  await waitForImages(clone);
  await waitFrame();

  try {
    return await toJpeg(clone, {
      quality: 0.95,
      pixelRatio: PIXEL_RATIO,
      canvasWidth: PAGE_W_PX * PIXEL_RATIO,
      canvasHeight: PAGE_H_PX * PIXEL_RATIO,
      width: PAGE_W_PX,
      height: PAGE_H_PX,
      backgroundColor: '#ffffff',
      cacheBust: true,
      style: {
        transform: 'none',
        margin: '0',
        boxShadow: 'none',
      },
    });
  } finally {
    host.remove();
  }
}

function collectA4Pages(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.a4-page')).filter((el) => {
    return !el.closest('[data-pdf-capture-host]');
  });
}

async function exportElementsAsPdf(
  pageElements: HTMLElement[],
  filename: string,
  onProgress?: (progress: number, statusText: string) => void
): Promise<void> {
  if (!pageElements.length) {
    throw new Error('A4 pages were not found. Open document preview and try again.');
  }

  onProgress?.(8, 'Preparing the on-screen A4 document...');

  if (document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined);
  }

  onProgress?.(12, 'Loading PDF generator...');
  const { default: jsPDF } = await import('jspdf');

  const pdf: jsPDFInstance = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const totalPages = pageElements.length;

  for (let i = 0; i < totalPages; i++) {
    onProgress?.(
      Math.round(18 + (i / totalPages) * 70),
      `Capturing page ${i + 1} of ${totalPages}...`
    );

    const imgData = await captureA4PageJpeg(pageElements[i]);

    if (i > 0) pdf.addPage('a4', 'portrait');
    pdf.addImage(imgData, 'JPEG', 0, 0, PAGE_W_MM, PAGE_H_MM, undefined, 'FAST');
  }

  onProgress?.(96, 'Downloading PDF...');
  pdf.save(withPdfExtension(filename));
  onProgress?.(100, 'PDF downloaded.');
}

export async function exportElementsToPdf(
  pageElements: HTMLElement[],
  options: ExportPdfOptions
): Promise<void> {
  return exportElementsAsPdf(pageElements, options.filename, options.onProgress);
}

/**
 * Snapshot the live `.a4-page` sheets (the document on screen) into an A4 PDF file.
 */
export async function downloadActiveDocumentAsPdf(
  filename: string,
  onProgress?: (progress: number, statusText: string) => void
): Promise<void> {
  const pageElements = collectA4Pages();
  if (pageElements.length === 0) {
    throw new Error('A4 document pages were not found. Switch to preview and try again.');
  }

  await exportElementsAsPdf(pageElements, filename, onProgress);
}
