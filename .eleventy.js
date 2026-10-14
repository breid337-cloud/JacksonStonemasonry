const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
  // When PATH_PREFIX is set (e.g. "/JacksonStonemasonry/" for GitHub Pages),
  // root-relative URLs in the HTML output are rewritten to include it.
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  // Print LAN URLs on `npm run serve` so the site can be opened from a phone
  // on the same wifi network.
  eleventyConfig.setServerOptions({ showAllHosts: true });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // Offer every photograph as AVIF first. `npm run images` writes 640/960/full-width AVIF
  // copies and lists them in src/_data/images.json; this wraps each matching <img> in a
  // <picture> whose <source> carries them, leaving the JPEG <img> as the fallback. The
  // <picture> is display:contents (main.css), so no layout rule sees it.
  // An entry whose original has changed since `npm run images` (say a photo replaced
  // through GitHub Desktop) is dropped, so that photo goes out as its JPEG, never as the
  // previous picture's AVIF.
  const crypto = require("node:crypto");
  const fs = require("node:fs");
  const images = {};
  for (const [src, img] of Object.entries(require("./src/_data/images.json"))) {
    const file = "src" + src;
    if (!fs.existsSync(file)) continue;
    const hash = crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex").slice(0, 12);
    if (hash === img.hash) images[src] = img;
    else console.warn(`[avif] ${src} has changed since \`npm run images\`; serving the JPEG only`);
  }
  eleventyConfig.addTransform("avif-picture", function (html) {
    if (!(this.page.outputPath || "").endsWith(".html")) return html;
    return html.replace(/(<picture[\s\S]*?<\/picture>)|<img\b[^>]*>/g, (tag, existing) => {
      if (existing) return tag;
      const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1];
      const img = src && images[src];
      if (!img) return tag;
      // One size only (the logo): a bare URL, since a lone width descriptor with no
      // sizes attribute would make the browser treat it as full-viewport width.
      const srcset = img.widths.length === 1 ? `${img.base}.avif`
        : img.widths.map((w, i) => `${img.base}${i === img.widths.length - 1 ? "" : "-" + w}.avif ${w}w`).join(", ");
      const sizes = (tag.match(/\ssizes="([^"]+)"/) || [])[1];
      return `<picture><source type="image/avif" srcset="${srcset}"${sizes ? ` sizes="${sizes}"` : ""}>${tag}</picture>`;
    });
  });

  // Sample case studies are illustrative only — not real Jackson's jobs — so
  // they are kept in src/projects/samples/ and never built. The projects
  // collection globs src/projects/*.md, which does not reach into that folder,
  // so they also cannot appear as cards anywhere. To publish one, rewrite it
  // around a real job and move it up into src/projects/.
  eleventyConfig.ignores.add("src/projects/samples/**");

  // Collections, sorted by the `order` front-matter key (then title)
  const byOrder = (a, b) =>
    (a.data.order ?? 99) - (b.data.order ?? 99) ||
    a.data.title.localeCompare(b.data.title);

  eleventyConfig.addCollection("services", (api) =>
    api.getFilteredByGlob("src/services/*.md").sort(byOrder)
  );
  eleventyConfig.addCollection("locations", (api) =>
    api.getFilteredByGlob("src/locations/*.md").sort(byOrder)
  );
  eleventyConfig.addCollection("projects", (api) =>
    api.getFilteredByGlob("src/projects/*.md").filter((p) => !p.data.sample).sort(byOrder)
  );

  // All indexable pages, for the XML sitemap
  eleventyConfig.addCollection("sitemap", (api) =>
    api
      .getAll()
      .filter((p) => p.outputPath && p.outputPath.endsWith(".html"))
      .filter((p) => !p.data.excludeFromSitemap)
  );

  // Join against the full base URL including any path (new URL('/x', base)
  // would drop a '/subpath' from the base, which breaks GitHub Pages).
  eleventyConfig.addFilter("absoluteUrl", (path, base) => {
    const b = base.endsWith("/") ? base : base + "/";
    return new URL(String(path).replace(/^\//, ""), b).href;
  });

  eleventyConfig.addFilter("isoDate", (d) => {
    return new Date(d).toISOString().split("T")[0];
  });

  return {
    pathPrefix: process.env.PATH_PREFIX || "/",
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
