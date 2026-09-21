# Source 03 — web.dev: Serve responsive images

URL: https://web.dev/articles/serve-responsive-images
Type: Primary platform guidance
Accessed: 2026-09-21

## Relevant evidence

web.dev notes that desktop-sized images can use substantially more data on mobile, and that responsive image selection can reduce resource load duration and improve LCP.

Short quote: “Serving desktop-sized images to mobile devices can use 2–4x more data.”

## Application to dntech

The redesign uses a lightweight CSS proof panel by default rather than adding another hero video or large media asset. If screenshots are added later, they should use fixed dimensions and responsive image sizing.

