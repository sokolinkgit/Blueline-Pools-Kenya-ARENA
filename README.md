# Blueline Pools Kenya

A responsive, multi-page marketing website for Blueline Pools Kenya, built with semantic HTML, CSS and vanilla JavaScript.

## Pages

- `index.html` — home, five service cards, trust strip, gallery preview, about story and quote CTA
- `services.html` — detailed service pages for all five flyer categories
- `gallery.html` — filterable project gallery with lightbox/carousel controls
- `about.html` — company story, values and Kenya-wide coverage
- `contact.html` — click-to-call, WhatsApp, validated quote form and Google Map

## Run locally

Serve the folder with any static server, for example:

```bash
python3 -m http.server 4173
```

Then visit `http://localhost:4173`.

## Swapping images

The preview uses remote reference photography so it works without a project photo library. See [`images/README.md`](images/README.md) for the exact local placeholder path intended for each image. Each HTML image also includes a `data-placeholder` attribute.

The contact form is intentionally client-side only. Connect its submit handler in `script.js` to the preferred CRM, email endpoint or backend before going live.
