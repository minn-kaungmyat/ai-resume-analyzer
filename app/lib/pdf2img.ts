export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  isLoading = true;
  // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
  loadPromise = import("pdfjs-dist/build/pdf.mjs").then(async (lib) => {
    // Import the worker from node_modules to ensure version match
    const workerModule =
      await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    lib.GlobalWorkerOptions.workerSrc = workerModule.default;
    pdfjsLib = lib;
    isLoading = false;
    return lib;
  });

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    console.log("Starting PDF conversion for:", file.name);
    const lib = await loadPdfJs();
    console.log("PDF.js library loaded successfully");

    const arrayBuffer = await file.arrayBuffer();
    console.log("File read as arrayBuffer, size:", arrayBuffer.byteLength);

    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    console.log("PDF document loaded, pages:", pdf.numPages);

    // Get all pages and render them to a single composite canvas
    const canvases: HTMLCanvasElement[] = [];
    let totalHeight = 0;
    let maxWidth = 0;

    // Render all pages to get their dimensions
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 4 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (context) {
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
      }

      await page.render({ canvasContext: context!, viewport }).promise;
      console.log(`Page ${pageNum} rendered to canvas`);

      canvases.push(canvas);
      totalHeight += viewport.height;
      maxWidth = Math.max(maxWidth, viewport.width);
    }

    // Create composite canvas
    const compositeCanvas = document.createElement("canvas");
    compositeCanvas.width = maxWidth;
    compositeCanvas.height = totalHeight;
    const compositeContext = compositeCanvas.getContext("2d");

    if (!compositeContext) {
      return {
        imageUrl: "",
        file: null,
        error: "Failed to create composite canvas context",
      };
    }

    // Draw all pages onto composite canvas
    let yOffset = 0;
    for (const canvas of canvases) {
      compositeContext.drawImage(canvas, 0, yOffset);
      yOffset += canvas.height;
    }

    console.log("All pages rendered to composite canvas successfully");

    return new Promise((resolve) => {
      compositeCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(
              "Composite blob created successfully, size:",
              blob.size
            );
            // Create a File from the blob with the same name as the pdf
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            console.error("Failed to create composite blob");
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });
          }
        },
        "image/png",
        1.0
      ); // Set quality to maximum (1.0)
    });
  } catch (err) {
    console.error("PDF conversion error:", err);
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}
