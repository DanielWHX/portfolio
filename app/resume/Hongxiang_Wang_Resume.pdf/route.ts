import pdfDataUrl from "./document.pdf?inline";
import { resumeDocument } from "@/lib/portfolio/resume-document";

const bytes = Uint8Array.from(atob(pdfDataUrl.slice(pdfDataUrl.indexOf(",") + 1)), char => char.charCodeAt(0));

export function GET(request: Request) {
  const disposition = new URL(request.url).searchParams.get("download") === "1" ? "attachment" : "inline";
  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${resumeDocument.downloadName}"`,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export function HEAD(request: Request) {
  return new Response(null, { headers: GET(request).headers });
}
