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

默认监听本机 8080 端口。网站文件为 `index.html`、`index.zh-CN.html`、`index.en.html`（旧英文地址的兼容跳转）、`styles.css`、`assets/`、`robots.txt` 和 `sitemap.xml`。

## 搜索与分享

网站的规范地址为 <https://aiprobuilder.github.io/flowx_web/>。中英文页面均包含规范地址、语言替代链接、社交分享元数据和结构化数据。站点地图仅列出规范的中英文页面；旧英文地址会跳转至首页。

搜索引擎只读取域名根目录下的 `robots.txt`。仓库中的文件适用于部署在域名根目录的站点，但 GitHub Pages 将本项目放在 `/flowx_web/` 子路径下，因此该文件无法控制共享域名。请在搜索引擎站长工具中提交 <https://aiprobuilder.github.io/flowx_web/sitemap.xml>，或在你有权限时将此站点地图地址添加到域名根目录的 `robots.txt`。

如果部署到其他规范域名或路径，请同步更新 HTML 元数据和结构化数据、`sitemap.xml`、`robots.txt` 以及 SEO 测试中的绝对地址，并确保分享图片可公开访问。可编辑源文件为 `assets/social-card.svg`；修改后需重新生成 `assets/social-card.png`（例如使用 `rsvg-convert`）。

可使用 Node.js 18 或更高版本运行 SEO 检查：`node --test tests/seo.test.cjs`。网站部署本身无需安装依赖。

## 了解 FlowX

有关安装、模型配置、MCP 接入、Python SDK、A2A 和许可证的最新信息，请参阅 [FlowX 项目文档](https://github.com/AIpRoBuilder/FlowX/blob/main/README.zh-CN.md)。

联系：<peterxcx@gmail.com>