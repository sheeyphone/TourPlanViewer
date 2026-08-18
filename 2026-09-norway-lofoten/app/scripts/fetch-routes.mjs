import { mkdirSync, existsSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import places from '../src/data/places.js'
import routes from '../src/data/routes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'routes')
const BASE = 'https://router.project-osrm.org/route/v1/driving'
const FORCE = process.argv.includes('--force')

const placeById = (id) => places.find((p) => p.id === id)

const driveSegments = routes.filter((r) => r.mode === 'drive' && r.geometryFile)

if (!driveSegments.length) {
  console.error('没有需要下载的 drive 段（请先在 routes.js 设置 geometryFile）')
  process.exit(1)
}

mkdirSync(OUT_DIR, { recursive: true })

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let done = 0
let skipped = 0

for (const seg of driveSegments) {
  const file = join(OUT_DIR, seg.geometryFile)
  if (!FORCE && existsSync(file)) {
    skipped++
    console.log(`[跳过] ${seg.geometryFile}（已存在，--force 重新下载）`)
    continue
  }

  const from = placeById(seg.from)
  const to = placeById(seg.to)
  if (!from || !to) {
    console.error(`[错误] ${seg.id} 缺少 from/to 坐标（${seg.from} / ${seg.to}）`)
    continue
  }

  const via = (seg.via || []).map(([lng, lat]) => `${lng},${lat}`).join(';')
  const waypoints = `${from.lng},${from.lat}${via ? ';' + via : ''};${to.lng},${to.lat}`
  const overview = seg.overview || 'simplified'
  const url = `${BASE}/${waypoints}?overview=${overview}&geometries=geojson`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    let geometry = data.routes?.[0]?.geometry
    if (!geometry) throw new Error('无 geometry')
    if (overview === 'full') {
      geometry = { type: 'LineString', coordinates: simplify(geometry.coordinates, seg.tolerance ?? 0.0025) }
    }
    writeFileSync(file, JSON.stringify(geometry, null, 2))
    const km = Math.round(data.routes[0].distance / 1000)
    done++
    console.log(`[完成] ${seg.geometryFile}  ${from.name} → ${to.name}  ${km}km  ${geometry.coordinates.length}点`)
  } catch (err) {
    console.error(`[失败] ${seg.geometryFile}  ${err.message}`)
  }

  await sleep(500)
}

function simplify(pts, tol) {
  if (pts.length < 3) return pts
  const keep = new Uint8Array(pts.length)
  keep[0] = keep[pts.length - 1] = 1
  const stack = [[0, pts.length - 1]]
  const dist = (a, b, c) => {
    const [x0, y0] = c, [x1, y1] = a, [x2, y2] = b
    const dx = x2 - x1, dy = y2 - y1
    if (dx === 0 && dy === 0) return Math.hypot(x0 - x1, y0 - y1)
    const t = Math.max(0, Math.min(1, ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy)))
    return Math.hypot(x0 - (x1 + t * dx), y0 - (y1 + t * dy))
  }
  while (stack.length) {
    const [s, e] = stack.pop()
    let maxD = 0, idx = -1
    for (let i = s + 1; i < e; i++) {
      const d = dist(pts[s], pts[e], pts[i])
      if (d > maxD) { maxD = d; idx = i }
    }
    if (maxD > tol && idx >= 0) {
      keep[idx] = 1
      stack.push([s, idx], [idx, e])
    }
  }
  return pts.filter((_, i) => keep[i])
}

console.log(`\n下载 ${done} 段，跳过 ${skipped} 段 → ${OUT_DIR}`)
