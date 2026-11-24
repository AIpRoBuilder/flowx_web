const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const site = 'https://www.flow-x.work/';
const imageUrl = `${site}assets/social-card.png`;
const demoUrl = `${site}assets/picture-workflow-demo.html`;
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const pairs = [
  { key: 'home', en: 'index.html', zh: 'index.zh-CN.html', enUrl: site, zhUrl: `${site}index.zh-CN.html`, type: 'SoftwareSourceCode' },
  { key: 'why', en: 'why.html', zh: 'why.zh-CN.html', enUrl: `${site}why.html`, zhUrl: `${site}why.zh-CN.html`, type: 'WebPage' },
  { key: 'tools', en: 'tools.html', zh: 'tools.zh-CN.html', enUrl: `${site}tools.html`, zhUrl: `${site}tools.zh-CN.html`, type: 'WebPage' },
  { key: 'showcase', en: 'showcase.html', zh: 'showcase.zh-CN.html', enUrl: `${site}showcase.html`, zhUrl: `${site}showcase.zh-CN.html`, type: 'CollectionPage' },
  { key: 'manual', en: 'manual.html', zh: 'manual.zh-CN.html', enUrl: `${site}manual.html`, zhUrl: `${site}manual.zh-CN.html`, type: 'TechArticle' },
];

function pageEntries(pair) {
  const alternates = { en: pair.enUrl, 'zh-CN': pair.zhUrl, 'x-default': pair.enUrl };
  return [
    { file: pair.en, language: 'en', url: pair.enUrl, locale: 'en_US', alternateLocale: 'zh_CN', alternates, type: pair.type },
    { file: pair.zh, language: 'zh-CN', url: pair.zhUrl, locale: 'zh_CN', alternateLocale: 'en_US', alternates, type: pair.type },
  ];
}

const pages = pairs.flatMap(pageEntries);

function tags(source, name) {
  return [...source.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) =>
    Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]))
  );
}

function only(items, description) {
  assert.equal(items.length, 1, `expected exactly one ${description}`);
  return items[0];
}

for (const page of pages) {
  test(`${page.language} ${page.file} has consistent SEO metadata`, () => {
    const html = read(page.file);
    const links = tags(html, 'link');
    const metas = tags(html, 'meta');
    const meta = (key, value) => only(metas.filter((item) => item[key] === value), value).content;

    assert.match(html, new RegExp(`<html lang="${page.language}">`));
    assert.ok(html.match(/<title>([^<]+)<\/title>/)?.[1]);
    assert.ok(meta('name', 'description'));
    const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1];
    assert.ok(head, 'expected a head element');
    assert.equal(
      only(tags(head, 'meta').filter((item) => item.name === 'google-site-verification'), 'Google site verification').content,
      'z1j2lOwTCyCSmdxdT_rCZAdQoIIs76KouPiEtdd7D3k'
    );
    assert.equal(
      only(tags(head, 'meta').filter((item) => item.name === 'baidu-site-verification'), 'Baidu site verification').content,
      'codeva-i7WjuOg6xc'
    );
    assert.equal(
      only(tags(head, 'meta').filter((item) => item.name === 'yandex-verification'), 'Yandex site verification').content,
      'f1fecc89b8e0a217'
    );
    assert.equal(only(links.filter((item) => item.rel === 'canonical'), 'canonical link').href, page.url);
    const languageLinks = links.filter((item) => item.rel === 'alternate' && item.hreflang);
    assert.equal(languageLinks.length, Object.keys(page.alternates).length);
    for (const [language, url] of Object.entries(page.alternates)) {
      assert.equal(only(languageLinks.filter((item) => item.hreflang === language), `${language} alternate`).href, url);
    }

    assert.equal(meta('property', 'og:url'), page.url);
    assert.equal(meta('property', 'og:locale'), page.locale);
    assert.equal(meta('property', 'og:locale:alternate'), page.alternateLocale);
    assert.ok(meta('property', 'og:title'));
    assert.ok(meta('property', 'og:description'));
    assert.equal(meta('property', 'og:image'), imageUrl);
    assert.equal(meta('property', 'og:image:type'), 'image/png');
    assert.equal(meta('property', 'og:image:width'), '1200');
    assert.equal(meta('property', 'og:image:height'), '630');
    assert.ok(meta('property', 'og:image:alt'));
    assert.equal(meta('name', 'twitter:card'), 'summary_large_image');
    assert.ok(meta('name', 'twitter:title'));
    assert.ok(meta('name', 'twitter:description'));
    assert.equal(meta('name', 'twitter:image'), imageUrl);
    assert.ok(meta('name', 'twitter:image:alt'));

    const json = only([...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)], 'structured data');
    const structured = JSON.parse(json[1]);
    assert.equal(structured['@type'], page.type);
    assert.equal(structured.url, page.url);
    assert.equal(structured.inLanguage, page.language);
    if (page.type === 'SoftwareSourceCode') {
      assert.equal(structured.codeRepository, 'https://github.com/AIpRoBuilder/FlowX');
    }

    assert.match(html, /href="styles\.css"/);
    assert.match(html, /src="assets\/site\.js" defer/);
    assert.match(html, /class="skip-link" href="#main"/);
    assert.match(html, /<main id="main">/);
  });
}

test('social preview is a 1200 by 630 PNG', () => {
  const image = fs.readFileSync(path.join(root, 'assets/social-card.png'));
  assert.deepEqual(image.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
});

test('sitemap lists canonical pages with reciprocal language links', () => {
  const sitemap = read('sitemap.xml');
  const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
  const expected = [...pairs.flatMap((pair) => [pair.enUrl, pair.zhUrl]), demoUrl];
  assert.equal(entries.length, expected.length);
  assert.deepEqual(entries.map((entry) => entry.match(/<loc>(.*?)<\/loc>/)?.[1]), expected);
  for (const [index, entry] of entries.slice(0, pages.length).entries()) {
    const page = pages[index];
    const languageLinks = tags(entry, 'xhtml:link');
    assert.equal(languageLinks.length, Object.keys(page.alternates).length);
    for (const [language, url] of Object.entries(page.alternates)) {
      const link = only(languageLinks.filter((item) => item.hreflang === language), `${language} sitemap alternate`);
      assert.equal(link.rel, 'alternate');
      assert.equal(link.href, url);
    }
  }
  assert.equal(tags(entries.at(-1), 'xhtml:link').length, 0, 'example page is English-only');
});

test('homepages point to the interactive picture workflow example', () => {
  for (const file of ['index.html', 'index.zh-CN.html']) {
    const html = read(file);
    assert.match(html, /<section class="section examples-section" id="examples">/);
    assert.match(html, /<a href="showcase(\.zh-CN)?\.html">/);
    const links = tags(html, 'a').filter((item) => item.href === 'assets/picture-workflow-demo.html');
    assert.ok(links.some((item) => item.class === 'example-card'), `${file} has a featured example card`);
  }
});

test('example page has its own canonical and share metadata', () => {
  const html = read('assets/picture-workflow-demo.html');
  const links = tags(html, 'link');
  const metas = tags(html, 'meta');
  assert.equal(only(links.filter((item) => item.rel === 'canonical'), 'example canonical').href, demoUrl);
  assert.ok(metas.some((item) => item.name === 'description'));
  assert.equal(
    only(metas.filter((item) => item.name === 'yandex-verification'), 'example Yandex verification').content,
    'f1fecc89b8e0a217'
  );
  assert.equal(only(metas.filter((item) => item.property === 'og:url'), 'example og:url').content, demoUrl);
});

test('example preview GIF is published and used by both homepages', () => {
  const gif = fs.readFileSync(path.join(root, 'assets/picture-workflow-demo.gif'));
  assert.equal(gif.subarray(0, 6).toString('ascii'), 'GIF89a');
  assert.equal(gif.readUInt16LE(6), 1024);
  assert.equal(gif.readUInt16LE(8), 720);
  for (const file of ['index.html', 'index.zh-CN.html']) {
    assert.match(read(file), /src="assets\/picture-workflow-demo\.gif"/);
  }
});

test('tools pages ship the full 22-tool registry with filters', () => {
  for (const file of ['tools.html', 'tools.zh-CN.html']) {
    const html = read(file);
    assert.equal([...html.matchAll(/data-tool-row/g)].length, 22, `${file} lists every MCP tool`);
    assert.equal([...html.matchAll(/data-tool-filter=/g)].length, 4, `${file} has four filter chips`);
    assert.match(html, /data-tool-search/);
    assert.match(html, /data-registry-empty/);
  }
});

test('manual pages expose the setup anchors used across the site', () => {
  for (const file of ['manual.html', 'manual.zh-CN.html']) {
    const html = read(file);
    for (const id of ['requirements', 'install', 'configure', 'mcp', 'agent-skill', 'first-build', 'sdk', 'a2a', 'architecture', 'guardrails']) {
      assert.match(html, new RegExp(`id="${id}"`), `${file} has #${id}`);
    }
  }
});

test('every page links the four product surfaces', () => {
  for (const page of pages) {
    const html = read(page.file);
    const suffix = page.language === 'zh-CN' ? '.zh-CN.html' : '.html';
    for (const name of ['why', 'tools', 'showcase', 'manual']) {
      assert.ok(html.includes(`href="${name}${suffix}"`), `${page.file} links ${name}${suffix}`);
    }
  }
});

test('crawler files and the compatibility redirect are included in deployments', () => {
  assert.match(read('robots.txt'), new RegExp(`Sitemap: ${site.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}sitemap\\.xml`));
  const redirect = read('index.en.html');
  assert.match(redirect, /content="0; url=index\.html"/);
  assert.match(redirect, /window\.location\.search \+ window\.location\.hash/);
  assert.equal(only(tags(redirect, 'link').filter((item) => item.rel === 'canonical'), 'redirect canonical').href, site);
  assert.match(read('nginx.conf'), /location = \/index\.en\.html\s*\{[^}]*return 301 \/\$is_args\$args;/);
  const dockerfile = read('Dockerfile');
  assert.match(dockerfile, /COPY \*\.html \/usr\/share\/nginx\/html\//);
  assert.match(dockerfile, /COPY robots\.txt sitemap\.xml \/usr\/share\/nginx\/html\//);
  assert.match(dockerfile, /COPY assets \/usr\/share\/nginx\/html\/assets/);
});