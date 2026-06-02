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

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))

// 不当作科目扫描的目录
const IGNORE = new Set(['.git', 'node_modules', '.wrangler', '.vscode', 'assets', 'public'])

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

const build = () => {
  const subjects = listSubjects()

  if (subjects.length === 0) {
    console.warn('⚠️  没有发现任何含 .html 笔记的科目文件夹，仍生成空首页。')
  }

  writeFileSync(join(ROOT, 'index.html'), homePage(subjects))
  subjects.forEach((subject) => writeFileSync(join(subject.dir, 'index.html'), subjectPage(subject)))

  console.log(`✅ 生成完成：首页 + ${subjects.length} 个科目页`)
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
