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

The default host port is 8080. The site consists of `index.html`, `index.zh-CN.html`, `index.en.html` (a compatibility redirect), `styles.css`, and `assets/`.

## Learn about FlowX

For current installation instructions, model configuration, MCP, Python SDK, A2A, and licensing information, refer to the [FlowX project documentation](https://github.com/AIpRoBuilder/FlowX#readme).

Contact: <peterxcx@gmail.com>