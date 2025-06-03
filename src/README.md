# Versions

This static site was original built as a Vite React app, that is the code within the [`subosity-www.disabled`](./subosity-www.disabled) directory.

In June 2025, the site was re-platformed to be a Gatsby React app, which is the code within the [`subosity-www`](./subosity-www) directory.

## Reasons

Below is a summary of the reasons for the change, and why Gatsby is a better choice for this site than Vite.

### <img src="https://vetores.org/d/vite-js-logo.svg" alt="Vite Logo" width="28" style="vertical-align:middle; margin-right:8px;" />Vite React

For a  static, informational site, Vite is note ideal because it is a *Single Page Application (SPA)*. This means practically that `/about` doesn't exist as a page. Instead,  that page is served by a client-side, Javascript-based router. So in your browser, when you first navigate to `/`, that is the "single page" that has all of this route information.

When SEO crawlers like Googlebot or Bingbot visit the site, they don't execute Javascript. So they only see the content of the `/` page, and won't "see" any of your other pages like `/about` or `/contact`. This means that those pages won't be indexed, and won't show up in search results.

### <img src="https://www.svgrepo.com/show/331403/gatsby.svg" alt="Gatsby Logo" width="28" style="vertical-align:middle; margin-right:8px;" />Gatsby React

Gatsby is a *Static Site Generator (SSG)*, which means that it generates the HTML for each page at build time. This means that when a crawler visits `/about`, it will see the content of that page, because an actual `/about.html` is rendered and exists as a file, and so it will be indexed by search engines.
