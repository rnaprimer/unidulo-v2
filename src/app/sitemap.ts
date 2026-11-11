import type { MetadataRoute } from "next";

// The list of public pages that search engines read at /sitemap.xml.
// Add a line here whenever a new page is added to the site.
const pages = ["", "/how-it-works", "/packaging", "/manufacturers", "/contact", "/quote"];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((path) => ({ url: `https://www.unidulo.com${path}` }));
}
