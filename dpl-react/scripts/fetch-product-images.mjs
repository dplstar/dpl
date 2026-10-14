// Copies the pipe / fitting images from the current dplstar.com site into
// public/img/products/, so the new site doesn't depend on the old one.
//
//   node scripts/fetch-product-images.mjs          (skips files already there)
//   node scripts/fetch-product-images.mjs --force  (downloads everything again)

import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PRODUCT_CATEGORIES } from '../src/data/productCategories.js'

const LIVE = 'https://dplstar.com/img/'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const force = process.argv.includes('--force')

const jobs = PRODUCT_CATEGORIES.flatMap((c) => c.items.map((i) => i.img)).map((publicPath) => ({
  url: LIVE + encodeURIComponent(path.posix.basename(publicPath)),
  out: path.join(root, 'public', publicPath)
}))

const exists = (p) => access(p).then(() => true, () => false)
let ok = 0
let failed = 0

for (const { url, out } of jobs) {
  if (!force && (await exists(out))) {
    console.log(`skip  ${path.relative(root, out)}`)
    ok++
    continue
  }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await mkdir(path.dirname(out), { recursive: true })
    await writeFile(out, Buffer.from(await res.arrayBuffer()))
    console.log(`saved ${path.relative(root, out)}`)
    ok++
  } catch (err) {
    console.error(`FAIL  ${url} (${err.message})`)
    failed++
  }
}

console.log(`\n${ok} ready, ${failed} failed`)
process.exitCode = failed ? 1 : 0
