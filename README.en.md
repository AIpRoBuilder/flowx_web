# FlowX Website

[简体中文](README.md) · [FlowX project](https://github.com/AIpRoBuilder/FlowX) · [Documentation](https://github.com/AIpRoBuilder/FlowX#readme)

This is the static introduction website for FlowX. FlowX is a generative workflow layer for AI agents, with MCP, Python SDK, and A2A interfaces for building, running, and evolving workflows. This repository contains the website only, not the FlowX engine or MCP server.

## Local preview

Serve this directory with any static file server, or open `index.html` in a browser. English is the default, with Chinese available through the language switcher. No build step or frontend dependencies are required.

## Deployment

The site can be deployed to GitHub Pages or another static host. An Nginx container is also provided and can be started with Docker Compose:

```sh
docker compose up --build -d
```

The default host port is 8080. The site consists of `index.html`, `index.zh-CN.html`, `index.en.html` (a compatibility redirect), `styles.css`, `assets/`, `robots.txt`, and `sitemap.xml`.

## Search and sharing

The canonical site is <https://www.flow-x.work/>. Both language pages include canonical and language-alternate links, social sharing metadata, and structured data. The sitemap lists only the canonical English and Chinese pages; the old English URL redirects to the homepage.

Search engines only read `robots.txt` from the domain root. When deployed at the root of the custom domain, the included file declares the sitemap URL. Submit <https://www.flow-x.work/sitemap.xml> in your search engine's webmaster tools.

When deploying to a different canonical domain or path, update the absolute URLs in the HTML metadata and structured data, `sitemap.xml`, `robots.txt`, and the SEO tests. Keep the share image publicly accessible. The editable source is `assets/social-card.svg`; regenerate `assets/social-card.png` after changing it (for example, with `rsvg-convert`).

Run the SEO checks with Node.js 18 or newer: `node --test tests/seo.test.cjs`. No dependencies are required to serve the site.

## Learn about FlowX

For current installation instructions, model configuration, MCP, Python SDK, A2A, and licensing information, refer to the [FlowX project documentation](https://github.com/AIpRoBuilder/FlowX#readme).

Contact: <peterxcx@gmail.com>