# Resume PDF

`app/resume/Hongxiang_Wang_Resume.pdf/document.pdf` is the unchanged, one-page PDF supplied by the owner on 2026-11-05. Preview and download share this file; `lib/portfolio/resume-document.ts` owns its preview URL, download URL and download name. The route explicitly sends `application/pdf` and either `inline` or `attachment` Content-Disposition because the pinned Vinext Node static server otherwise serves PDFs as application/octet-stream. The server bundles the bytes using [Vite explicit inline asset handling](https://vite.dev/guide/assets.html#explicit-inline-handling), so no runtime filesystem or self-fetch is required.

SHA-256: `0250bbca9cc9d05b6d2e1390cf4f0ba13943f553fa60d2b274d153794f35b6ea`

To replace it, use an owner-approved PDF, retain the stable URL, update this provenance/hash and verify both links and downloaded bytes. Keep the original source document unchanged.

## Content alignment pending

The supplied document lists UIUC as Jan. 2027–Dec. 2028 and PCITC as May 2026–Sep. 2026. The current approved application profile lists Aug. 2026–Apr. 2028 and May 2026–Aug. 2026 respectively. The owner needs to confirm which dates to use before synchronizing them.

Adding the download does not parse PDF content into Agent facts or replace existing profile dates and project claims.
