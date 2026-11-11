# Resume PDF

`app/resume/Hongxiang_Wang_Resume.pdf/document.pdf` is the unchanged, one-page PDF supplied by the owner on 2026-11-05. Preview and download share this file; `lib/portfolio/resume-document.ts` owns its preview URL, download URL and download name. The route explicitly sends `application/pdf` and either `inline` or `attachment` Content-Disposition because the pinned Vinext Node static server otherwise serves PDFs as application/octet-stream. The server bundles the bytes using [Vite explicit inline asset handling](https://vite.dev/guide/assets.html#explicit-inline-handling), so no runtime filesystem or self-fetch is required.

SHA-256: `0250bbca9cc9d05b6d2e1390cf4f0ba13943f553fa60d2b274d153794f35b6ea`

To replace it, use an owner-approved PDF, retain the stable URL, update this provenance/hash and verify both links and downloaded bytes. Keep the original source document unchanged.

## Verification when replacing the PDF

After rebuilding, check the following:

- Preview PDF opens the document in a new tab; the original chat remains available.
- Download PDF saves the expected filename and the exact approved file bytes. Update the SHA-256 above when replacing the document.
- A direct resume request shows the same links, and reloading retains them without another chat request or losing the draft.
- At 320px width, both actions remain usable without horizontal overflow.

Run the [API checks](../tests/rendered-html.test.mjs) and [focused browser checks](../tests/browser/resume-links.spec.ts):

```bash
npm run build
npm run test:api
PLAYWRIGHT_CHANNEL=chrome npm run test:ui -- tests/browser/resume-links.spec.ts
```

Use an installed Chrome for the last command, or install Playwright Chromium and omit `PLAYWRIGHT_CHANNEL`. Chat responses in these checks are mocked; production deployment is verified separately in the [operations handbook](handbook/04-development-and-operations.md).

## Content alignment pending

The supplied document lists UIUC as Jan. 2027–Dec. 2028 and PCITC as May 2026–Sep. 2026. The current approved application profile lists Aug. 2026–Apr. 2028 and May 2026–Aug. 2026 respectively. The owner needs to confirm which dates to use before synchronizing them.

Adding the download does not parse PDF content into Agent facts or replace existing profile dates and project claims.
