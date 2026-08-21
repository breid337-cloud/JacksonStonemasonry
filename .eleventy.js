module.exports = function (eleventyConfig) {
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

  eleventyConfig.addFilter("absoluteUrl", (path, base) => {
    return new URL(path, base).href;
  });

  eleventyConfig.addFilter("isoDate", (d) => {
    return new Date(d).toISOString().split("T")[0];
  });

  return {
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
