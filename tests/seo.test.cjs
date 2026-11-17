const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const site = 'https://www.flow-x.work/';
const alternates = {
  en: site,
  'zh-CN': `${site}index.zh-CN.html`,
  'x-default': site,
};
const imageUrl = `${site}assets/social-card.png`;
const demoUrl = `${site}assets/picture-workflow-demo.html`;
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function tags(source, name) {
  return [...source.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))].map(([tag]) =>
    Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]))
  );
}

function only(items, description) {
  assert.equal(items.length, 1, `expected exactly one ${description}`);
  return items[0];
}

for (const page of [
  { file: 'index.html', language: 'en', url: site, locale: 'en_US', alternateLocale: 'zh_CN' },
  { file: 'index.zh-CN.html', language: 'zh-CN', url: alternates['zh-CN'], locale: 'zh_CN', alternateLocale: 'en_US' },
]) {
  test(`${page.language} page has consistent SEO metadata`, () => {
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
    assert.equal(languageLinks.length, Object.keys(alternates).length);
    for (const [language, url] of Object.entries(alternates)) {
      assert.equal(only(languageLinks.filter((item) => item.hreflang === language), `${language} alternate`).href, url);
    }

    assert.equal(meta('property', 'og:type'), 'website');
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
    assert.equal(structured['@type'], 'SoftwareSourceCode');
    assert.equal(structured.url, page.url);
    assert.equal(structured.inLanguage, page.language);
    assert.equal(structured.codeRepository, 'https://github.com/AIpRoBuilder/FlowX');
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
  assert.equal(entries.length, 3);
  assert.deepEqual(
    entries.map((entry) => entry.match(/<loc>(.*?)<\/loc>/)?.[1]),
    [site, alternates['zh-CN'], demoUrl]
  );
  for (const entry of entries.slice(0, 2)) {
    const languageLinks = tags(entry, 'xhtml:link');
    assert.equal(languageLinks.length, Object.keys(alternates).length);
    for (const [language, url] of Object.entries(alternates)) {
      const link = only(languageLinks.filter((item) => item.hreflang === language), `${language} sitemap alternate`);
      assert.equal(link.rel, 'alternate');
      assert.equal(link.href, url);
    }
  }
  assert.equal(tags(entries[2], 'xhtml:link').length, 0, 'example page is English-only');
});

test('homepages point to the interactive picture workflow example', () => {
  for (const file of ['index.html', 'index.zh-CN.html']) {
    const html = read(file);
    assert.match(html, /<section class="section examples-section" id="examples">/);
    assert.match(html, /<a href="#examples">/);
    const links = tags(html, 'a').filter((item) => item.href === 'assets/picture-workflow-demo.html');
    assert.equal(only(links, `${file} example link`).class, 'example-card');
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

test('crawler files and the compatibility redirect are included in deployments', () => {
  assert.match(read('robots.txt'), new RegExp(`Sitemap: ${site.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}sitemap\\.xml`));
  const redirect = read('index.en.html');
  assert.match(redirect, /content="0; url=index\.html"/);
  assert.match(redirect, /window\.location\.search \+ window\.location\.hash/);
  assert.equal(only(tags(redirect, 'link').filter((item) => item.rel === 'canonical'), 'redirect canonical').href, site);
  assert.match(read('nginx.conf'), /location = \/index\.en\.html\s*\{[^}]*return 301 \/\$is_args\$args;/);
  const dockerfile = read('Dockerfile');
  assert.match(dockerfile, /COPY robots\.txt sitemap\.xml \/usr\/share\/nginx\/html\//);
  assert.match(dockerfile, /COPY assets \/usr\/share\/nginx\/html\/assets/);
});