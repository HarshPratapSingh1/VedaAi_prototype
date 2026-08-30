export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // strip the "data:<mime>;base64," prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export type PageImage = {
  pageNumber: number; // 1-indexed
  dataUrl: string;
};

/**
 * Renders every page of a PDF (or wraps a plain image file as a single
 * "page") into data URLs so we can display them and overlay highlight
 * boxes on top. This is purely for display — the raw file bytes are sent
 * separately per-page to Groq's vision model for extraction.
 */
export async function fileToPageImages(file: File): Promise<PageImage[]> {
  if (file.type === "application/pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pages: PageImage[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.8 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      pages.push({ pageNumber: i, dataUrl: canvas.toDataURL("image/png") });
    }
    return pages;
  }

  // Plain image file (e.g. a phone photo) -> normalize through a canvas.
  // Phone photos can be very large (4000px+) and carry EXIF rotation data;
  // sending that raw to the vision model's encoder is what caused bounding
  // boxes to drift on real handwriting tests. Drawing through <img> + canvas
  // both normalizes size and lets the browser apply EXIF orientation
  // consistently, and — critically — the exact same normalized image is
  // used for display AND sent to the model, so overlay coordinates always
  // match what the model actually analyzed.
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1600;
        const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
  return [{ pageNumber: 1, dataUrl }];
}