# FlowX 网站

[English](README.en.md) · [FlowX 项目](https://github.com/AIpRoBuilder/FlowX) · [中文文档](https://github.com/AIpRoBuilder/FlowX/blob/main/README.zh-CN.md)

这是 FlowX 的静态介绍网站。FlowX 是面向 AI Agent 的生成式工作流层，通过 MCP、Python SDK 和 A2A 适配器生成、运行和演进工作流。本仓库只包含网站，不包含 FlowX 引擎或 MCP 服务。

## 本地预览

使用任意静态文件服务器提供本目录，或直接在浏览器中打开 `index.html`。首页默认显示英文，可在导航中切换至中文；页面无需构建或安装前端依赖。

## 部署

网站可以部署到 GitHub Pages 等静态托管服务。仓库也提供 Nginx 容器配置，可通过 Docker Compose 启动：

```sh
docker compose up --build -d
```

默认监听本机 8080 端口。网站文件为 `index.html`、`index.zh-CN.html`、`index.en.html`（旧英文地址的兼容跳转）、`styles.css` 和 `assets/`。

## 了解 FlowX

有关安装、模型配置、MCP 接入、Python SDK、A2A 和许可证的最新信息，请参阅 [FlowX 项目文档](https://github.com/AIpRoBuilder/FlowX/blob/main/README.zh-CN.md)。

联系：<peterxcx@gmail.com>