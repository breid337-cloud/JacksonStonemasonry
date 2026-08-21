const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
  // When PATH_PREFIX is set (e.g. "/JacksonStonemasonry/" for GitHub Pages),
  // root-relative URLs in the HTML output are rewritten to include it.
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  // Print LAN URLs on `npm run serve` so the site can be opened from a phone
  // on the same wifi network.
  eleventyConfig.setServerOptions({ showAllHosts: true });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

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
    api.getFilteredByGlob("src/projects/*.md").sort(byOrder)
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
