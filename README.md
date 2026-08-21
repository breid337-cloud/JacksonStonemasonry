# Jackson's Stonemasonry — SEO-first website

A rebuilt website for **Jackson's Stonemasonry Ltd** (Winchcombe, Gloucestershire): a local-business lead-generation site rather than a brochure. Built as a small content **system** — services, locations, projects, FAQs and reviews are data files and markdown, so new pages are added by adding a file, not by editing HTML.

Built with [Eleventy](https://www.11ty.dev/) (11ty). No client-side framework; one small JS file for the mobile menu.

## Quick start

```bash
npm install
npm run serve    # local dev server at http://localhost:8080
npm run build    # static site output to _site/
```

Deploy the `_site/` folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, Vercel…).

## Site structure

```
/                      Homepage — "Traditional Stonemasonry & Dry Stone Walling in the Cotswolds"
/services/             Services hub
/dry-stone-walling/    ┐
/stone-restoration/    │
/stone-cleaning/       │ One SEO-targeted page per service (700–1200 words each)
/stone-carving/        │
/stonemasonry/         │
/stone-wall-repair/    ┘
/projects/             Case-study index + one page per project (before/during/after format)
/areas/                Areas hub + one genuinely-local page per area:
                       Winchcombe, Cheltenham, Gloucester, Tewkesbury, Broadway,
                       Stow-on-the-Wold, Cirencester, the Cotswolds
/about/  /reviews/  /faqs/  /quote/  /thank-you/  /404.html
/sitemap.xml  /robots.txt
```

Technical SEO baked in: unique title + meta description per page, canonical URLs, Open Graph tags, `LocalBusiness` / `Service` / `BreadcrumbList` / `FAQPage` JSON-LD, XML sitemap, robots.txt, lazy-loaded images, semantic H1/H2 hierarchy, heavy internal linking between services ↔ locations ↔ projects.

## How to add content (the "CMS")

| To add…        | Do this |
|----------------|---------|
| A new service  | Copy a file in `src/services/`, edit front matter + content. It automatically appears in the nav footer, services hub, homepage grid and sidebars. |
| A new location | Copy a file in `src/locations/`. Appears in the areas hub, footer and sidebars automatically. |
| A new project  | Copy a file in `src/projects/`. Set `serviceKey` to the matching service so it appears on that service's page. |
| A review       | Edit `src/_data/reviews.json`. |
| An FAQ         | Edit `src/_data/faqs.json` — the FAQ page and its `FAQPage` structured data update automatically. |
| Phone/address/areas | Edit `src/_data/site.json` — used everywhere, including structured data. Keep it identical to the Google Business Profile (NAP consistency). |

## ⚠️ Before launch — required

1. **Set the real domain** in `src/_data/site.json` (`url`). It currently points at the live Netlify address; when the business buys a domain (e.g. `jacksonsstonemasonry.co.uk`), attach it in Netlify and change this value — it drives canonicals, the sitemap and structured data.
2. **Set the real email** in `src/_data/site.json`.
3. **Replace the placeholder reviews** in `src/_data/reviews.json` with genuine customer reviews (with permission — ideally copied from Google). The placeholders are clearly marked and must not go live: publishing invented reviews is unlawful. Review/AggregateRating schema is deliberately not emitted until reviews are real.
4. **Replace the sample projects** in `src/projects/` with real Jackson's jobs — each currently carries a visible "Sample case study" banner (remove the `note-box` div once real). Real before/during/after photos are the single highest-value content on the site.
5. **Replace placeholder images** with real photography. The hero backgrounds (`hero-wall.jpg` landscape, `hero-wall-mobile.jpg` portrait) are a real customer photo of a house Jackson's repointed — overwrite those files to change every hero on the site, no code changes. Five of the six service-card images (`service-*.jpg`, all except stone restoration) are **illustrations rendered in code**, not photographs of Jackson's work — they depict the service (dry stone coursing, a collapsed gap, soiled-vs-clean stone, incised lettering, dressed ashlar) and are honest placeholders, but real job photos should replace them. Project thumbnails still use `placeholder-wall.svg`, and `og-default.svg` should become a real 1200×630 JPG/PNG (update the two references in `base.njk` and `schema-localbusiness.njk`).
6. **Wire up the quote form** (`src/quote.njk`): on Netlify it works as-is (`data-netlify="true"`); otherwise point `action` at a Formspree/Basin-style endpoint.
7. **Flesh out the About page** — it has a marked note asking for the real story, accreditations and a photo.
8. **Verify factual claims** — insurance, opening hours (`site.json`), guarantees — with the business owner. The copy asserts full public liability insurance and free quotations, as the current site does.

## After launch — the local-SEO half of the project

The website is only half of local search. The rest, roughly in order of impact:

1. **Google Business Profile** — claim/optimise it; category "Stonemasonry", service area = the 8 area pages, same name/phone as `site.json`, link to the site; add photos of real work regularly. Paste the profile link into `site.json` → `googleBusinessProfileUrl` (enables the "Read our reviews on Google" button).
2. **Reviews engine** — after every job, text the customer a direct Google-review link. This is the highest-ROI marketing a tradesman can do.
3. **Google Search Console** — verify the domain, submit `/sitemap.xml`, watch which queries each service/location page ranks for.
4. **Citations** — consistent NAP on Checkatrade/Yell/Houzz/Facebook etc.
5. **Keep adding projects** — one short case study per finished job compounds into dozens of long-tail rankings.
