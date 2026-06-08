#!/usr/bin/env node
// build-index.mjs
// 扫描每个科目文件夹下的笔记 HTML，自动生成站点首页与各科目索引页。
// 不依赖任何第三方包（仅 Node 内置模块），可直接 `node build-index.mjs` 运行。
//
// 约定：
//   <根>/<科目>/xxx.html        一篇笔记（文件内 <title> 作为显示标题）
//   <根>/<科目>/meta.json       可选，{ "title": "显示名", "description": "...", "order": 1 }
// 生成（属于产物，已在 .gitignore 中忽略）：
//   <根>/index.html             首页：列出所有科目
//   <根>/<科目>/index.html      科目页：列出该科目所有笔记

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const DIST = join(ROOT, 'dist')

// 不当作科目扫描的目录
const IGNORE = new Set(['.git', 'node_modules', '.wrangler', '.vscode', 'assets', 'public', 'dist'])

// 与笔记一致的视觉基底（绿色 accent + 衬线），外加首页/列表所需的卡片样式
const BASE_CSS = `
  :root { --ink:#22272e; --muted:#5b636b; --accent:#2f6f4f; --soft:#eaf3ee; --rule:#dfe2dc; }
  * { box-sizing: border-box; }
  body {
    max-width: 820px; margin: 0 auto; padding: 48px 28px 96px; color: var(--ink);
    font-family: "Iowan Old Style", "Palatino Linotype", "Source Han Serif SC",
                 "Songti SC", Georgia, serif;
    line-height: 1.75; font-size: 1.04rem;
    background: #fcfcfa;
  }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .site-head { margin-bottom: 2em; }
  .site-head h1 { font-size: 2rem; border-bottom: 2px solid var(--accent); padding-bottom: 10px; margin: .2em 0; }
  .sub { color: var(--muted); margin: .3em 0 0; }
  .crumb { margin: 0 0 .6em; font-size: .95rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
  .card {
    display: flex; flex-direction: column; gap: 6px;
    padding: 20px 22px; border: 1px solid var(--rule); border-radius: 12px; background: #fff;
    transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
  }
  .card:hover { border-color: var(--accent); box-shadow: 0 4px 16px rgba(47,111,79,.10); transform: translateY(-2px); text-decoration: none; }
  .card-title { font-size: 1.2rem; color: var(--accent); font-weight: 600; }
  .card-meta { color: var(--muted); font-size: .92rem; }
  .note-list { list-style: none; padding: 0; margin: 0; }
  .note-list li { border-bottom: 1px solid var(--rule); }
  .note-list li:first-child { border-top: 1px solid var(--rule); }
  .note-list a { display: block; padding: 14px 6px; font-size: 1.1rem; }
  .note-list a:hover { background: var(--soft); text-decoration: none; padding-left: 14px; transition: padding-left .12s ease; }
  .foot { margin-top: 3em; color: var(--muted); font-size: .85rem; text-align: center; }
  @media (max-width: 600px) {
    body { padding: 28px 16px 64px; font-size: 1rem; }
    .site-head h1 { font-size: 1.6rem; }
    .grid { grid-template-columns: 1fr; gap: 12px; }
    .card { padding: 16px 18px; }
    .card-title { font-size: 1.1rem; }
    .note-list a { padding: 16px 6px; }
  }
`

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// 让 week2 排在 week10 前面（数值感知排序）
const naturalSort = (a, b) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })

const extractTitle = (html, fallback) => {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i)
  return m ? m[1].replace(/\s+/g, ' ').trim() : fallback
}

const readMeta = (dir) => {
  const file = join(dir, 'meta.json')
  if (!existsSync(file)) return {}
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    console.warn(`⚠️  忽略无法解析的 ${file}：${error.message}`)
    return {}
  }
}

const isNoteFile = (name) => name.endsWith('.html') && name !== 'index.html'

const listNotes = (subjectDir) =>
  readdirSync(subjectDir)
    .filter(isNoteFile)
    .sort(naturalSort)
    .map((file) => {
      const html = readFileSync(join(subjectDir, file), 'utf8')
      return { file, title: extractTitle(html, file.replace(/\.html$/, '')) }
    })

const listSubjects = () =>
  readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !IGNORE.has(entry.name))
    .map((entry) => {
      const dir = join(ROOT, entry.name)
      return { name: entry.name, dir, notes: listNotes(dir), meta: readMeta(dir) }
    })
    .filter((subject) => subject.notes.length > 0)
    .sort((a, b) => {
      const orderA = a.meta.order ?? 999
      const orderB = b.meta.order ?? 999
      return orderA !== orderB ? orderA - orderB : naturalSort(a.name, b.name)
    })

const page = ({ title, body }) => `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>${BASE_CSS}</style>
</head>
<body>
${body}
</body>
</html>
`

const homePage = (subjects) => {
  const cards = subjects
    .map((subject) => {
      const label = subject.meta.title || subject.name
      return `  <a class="card" href="./${encodeURIComponent(subject.name)}/index.html">
    <span class="card-title">${escapeHtml(label)}</span>
    <span class="card-meta">${subject.notes.length} 篇笔记</span>
  </a>`
    })
    .join('\n')

  return page({
    title: 'UOW复习笔记',
    body: `<header class="site-head">
  <h1>UOW复习笔记</h1>
  <p class="sub">按科目整理</p>
</header>
<nav class="grid">
${cards}
</nav>
<footer class="foot">共 ${subjects.length} 门科目 · 本文件由 build-index.mjs 自动生成，请勿手动编辑</footer>`,
  })
}

const subjectPage = (subject) => {
  const label = subject.meta.title || subject.name
  const items = subject.notes
    .map((note) => `  <li><a href="./${encodeURIComponent(note.file)}">${escapeHtml(note.title)}</a></li>`)
    .join('\n')

  return page({
    title: label,
    body: `<header class="site-head">
  <p class="crumb"><a href="../index.html">← 全部科目</a></p>
  <h1>${escapeHtml(label)}</h1>
  ${subject.meta.description ? `<p class="sub">${escapeHtml(subject.meta.description)}</p>` : ''}
</header>
<ul class="note-list">
${items}
</ul>
<footer class="foot">${subject.notes.length} 篇 · 本文件由 build-index.mjs 自动生成，请勿手动编辑</footer>`,
  })
}

// ── 笔记页增强：章节提纲（TOC）+ 返回科目主页 ───────────────────────────────
// 笔记正文里的 <h2>/<h3> 已带 id（由生成笔记的工具自动加），所以这里只需在
// 「拷贝进 dist/」时解析这些标题、拼出一个可点击跳转的目录侧栏并注入。
// 源笔记文件完全不改动；改动只发生在 dist/ 的副本里。

// 从笔记 HTML 中按出现顺序提取带 id 的 h2 / h3 标题
const extractHeadings = (html) => {
  const re = /<h([23])\s+[^>]*?id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi
  const headings = []
  let m
  while ((m = re.exec(html)) !== null) {
    const text = m[3].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    if (text) headings.push({ level: Number(m[1]), id: m[2], text })
  }
  return headings
}

// 侧栏面板（桌面固定显示，手机折叠为抽屉）的标记
const tocPanel = (headings, subjectLabel) => {
  const back = `<a class="toc-back" href="./index.html">← 返回 ${escapeHtml(subjectLabel)}</a>`
  const nav = headings.length
    ? `  <nav class="toc-nav" aria-label="章节目录">
    <p class="toc-title">本章目录</p>
    <ul>
${headings
  .map((h) => `      <li class="toc-l${h.level}"><a href="#${escapeHtml(h.id)}">${escapeHtml(h.text)}</a></li>`)
  .join('\n')}
    </ul>
  </nav>`
    : ''
  return `<button class="toc-toggle" type="button" aria-controls="note-toc" aria-expanded="false">☰ 目录</button>
<div class="toc-backdrop" hidden></div>
<aside class="toc-panel" id="note-toc">
  <div class="toc-inner">
    ${back}
${nav}
  </div>
</aside>`
}

// 注入用的样式：桌面按 2:8 切两栏（左导航/右正文，各自栏内居中）；窄屏改为抽屉 + 浮动按钮
// 想换 3:7 只改 --nav-w 一处（20vw → 30vw）；--read-w 是正文阅读限宽
const NAV_CSS = `
  :root { --drawer-w: 288px; --nav-w: 20vw; --read-w: 720px; --nav-max: 264px; }
  .toc-toggle {
    position: fixed; top: 12px; left: 12px; z-index: 60;
    font: inherit; font-size: .9rem; padding: 7px 13px; line-height: 1;
    color: #fff; background: var(--accent, #2f6f4f); border: 0; border-radius: 8px;
    cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.18);
  }
  .toc-backdrop {
    position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,.38);
    opacity: 0; pointer-events: none; transition: opacity .2s ease;
  }
  .toc-panel {
    position: fixed; top: 0; left: 0; z-index: 55;
    width: var(--drawer-w); height: 100vh; height: 100dvh; overflow-y: auto;
    padding: 22px 18px 48px; background: #fff;
    border-right: 1px solid var(--rule, #dfe2dc);
    font-family: "Iowan Old Style", "Palatino Linotype", "Source Han Serif SC",
                 "Songti SC", Georgia, serif;
    transform: translateX(-100%); transition: transform .25s ease;
  }
  .toc-back { display: block; font-size: .92rem; margin-bottom: 16px; color: var(--accent, #2f6f4f); }
  .toc-title { font-size: .75rem; letter-spacing: .08em; text-transform: uppercase;
    color: var(--muted, #5b636b); margin: 0 0 8px; }
  .toc-nav ul { list-style: none; margin: 0; padding: 0; }
  .toc-nav li { margin: 0; }
  .toc-nav a { display: block; padding: 5px 9px; border-radius: 6px; line-height: 1.4;
    font-size: .92rem; color: var(--ink, #22272e); text-decoration: none;
    border-left: 2px solid transparent; }
  .toc-nav a:hover { background: var(--soft, #eaf3ee); text-decoration: none; }
  .toc-l3 a { padding-left: 24px; font-size: .86rem; color: var(--muted, #5b636b); }
  .toc-nav a.active { font-weight: 600; color: var(--accent, #2f6f4f);
    background: var(--soft, #eaf3ee); border-left-color: var(--accent, #2f6f4f); }
  h2[id], h3[id] { scroll-margin-top: 24px; }
  body.toc-open .toc-panel { transform: translateX(0); box-shadow: 0 0 32px rgba(0,0,0,.18); }
  body.toc-open .toc-backdrop { opacity: 1; pointer-events: auto; }
  @media (max-width: 1079px) { body { padding-top: 64px; } }
  /* 桌面：屏幕按 2:8 切两栏——左栏放导航并在栏内居中，右栏放正文并在栏内居中。
     左栏宽 = --nav-w（20vw，改 30vw 即 3:7）；右栏 = 余下空间，正文限宽 --read-w。
     用 max()/min() 兜底，保证临界宽度下正文既不挤进导航栏、也不溢出。 */
  @media (min-width: 1080px) {
    .toc-toggle, .toc-backdrop { display: none; }
    .toc-panel {
      transform: none;
      width: var(--nav-w);
      padding: 0;
      display: flex;
      flex-direction: column;
    }
    .toc-inner {
      margin: auto;            /* flex 子项 margin:auto —— 栏内水平+垂直居中，内容超高时仍可滚动 */
      width: 100%;
      max-width: var(--nav-max);
      padding: 40px 20px;
    }
    body {
      max-width: min(var(--read-w), calc(100vw - var(--nav-w) - 64px));
      margin-left: calc(var(--nav-w) + max(32px, (100vw - var(--nav-w) - var(--read-w)) / 2));
      margin-right: auto;
      padding-left: 0;
      padding-right: 0;
    }
  }
`

// 注入用的脚本：抽屉开关 + 滚动高亮当前章节（无依赖、纯原生）
const NAV_JS = `
(function () {
  var body = document.body;
  var toggle = document.querySelector('.toc-toggle');
  var backdrop = document.querySelector('.toc-backdrop');
  var panel = document.getElementById('note-toc');
  if (!panel) return;
  var small = window.matchMedia('(max-width: 1079px)');
  function setOpen(open) {
    body.classList.toggle('toc-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (backdrop) backdrop.hidden = !open;
  }
  if (toggle) toggle.addEventListener('click', function () { setOpen(!body.classList.contains('toc-open')); });
  if (backdrop) backdrop.addEventListener('click', function () { setOpen(false); });
  var links = {};
  var anchors = panel.querySelectorAll('.toc-nav a');
  anchors.forEach(function (a) {
    links[a.getAttribute('href').slice(1)] = a;
    a.addEventListener('click', function () { if (small.matches) setOpen(false); });
  });
  var heads = [].slice.call(document.querySelectorAll('h2[id], h3[id]')).filter(function (h) { return links[h.id]; });
  if (!heads.length) return;
  var current = null;
  function setActive(id) {
    if (id === current) return;
    if (current && links[current]) links[current].classList.remove('active');
    current = id;
    if (links[id]) {
      links[id].classList.add('active');
      if (!small.matches) links[id].scrollIntoView({ block: 'nearest' });
    }
  }
  function onScroll() {
    var y = window.scrollY + 120;
    var activeId = heads[0].id;
    for (var i = 0; i < heads.length; i++) {
      if (heads[i].offsetTop <= y) activeId = heads[i].id; else break;
    }
    setActive(activeId);
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { requestAnimationFrame(function () { onScroll(); ticking = false; }); ticking = true; }
  }, { passive: true });
  onScroll();
})();
`

// 把目录侧栏 + 返回链接注入到一篇笔记 HTML（不改源文件，只改 dist 副本）
const injectNav = (html, subjectLabel) => {
  if (html.includes('id="note-toc"')) return html // 已注入则跳过（幂等）
  const panel = tocPanel(extractHeadings(html), subjectLabel)
  return html
    .replace(/<\/head>/i, () => `<style>${NAV_CSS}</style>\n</head>`)
    .replace(/<body[^>]*>/i, (open) => `${open}\n${panel}`)
    .replace(/<\/body>/i, () => `<script>${NAV_JS}</script>\n</body>`)
}

// 把可发布内容（首页、各科目页、笔记副本）输出到独立的 dist/ 目录，
// 供 Cloudflare Workers 静态资源部署（见 wrangler.jsonc 的 assets.directory = ./dist）。
const build = () => {
  const subjects = listSubjects()

  if (subjects.length === 0) {
    console.warn('⚠️  没有发现任何含 .html 笔记的科目文件夹，仍生成空首页。')
  }

  rmSync(DIST, { recursive: true, force: true })
  mkdirSync(DIST, { recursive: true })
  writeFileSync(join(DIST, 'index.html'), homePage(subjects))

  subjects.forEach((subject) => {
    const outDir = join(DIST, subject.name)
    const subjectLabel = subject.meta.title || subject.name
    mkdirSync(outDir, { recursive: true })
    subject.notes.forEach((note) => {
      const src = readFileSync(join(subject.dir, note.file), 'utf8')
      writeFileSync(join(outDir, note.file), injectNav(src, subjectLabel))
    })
    writeFileSync(join(outDir, 'index.html'), subjectPage(subject))
  })

  console.log(`✅ 构建完成 → dist/（首页 + ${subjects.length} 个科目页 + 笔记副本）`)
  subjects.forEach((subject) =>
    console.log(`   - ${subject.meta.title || subject.name}：${subject.notes.length} 篇`),
  )
}

try {
  build()
} catch (error) {
  console.error('❌ 生成索引失败：', error.message)
  process.exit(1)
}
