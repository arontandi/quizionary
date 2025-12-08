import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractWithPdfJs(buffer: Buffer): Promise<string> {
    const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

    const loadingTask = getDocument({ data });
    const doc = await loadingTask.promise;

    let out = '';
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        out += content.items
            .map((it: any) => (typeof it?.str === 'string' ? it.str : ''))
            .join(' ')
            .replace(/\s+\n/g, '\n')
            .trim() + '\n';
    }

    return out.trim();
}