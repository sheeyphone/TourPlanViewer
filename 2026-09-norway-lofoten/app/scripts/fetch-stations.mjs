import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import places from '../src/data/places.js'
import routes from '../src/data/routes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'stations')
const ROUTES_DIR = join(__dirname, '..', 'public', 'routes')
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]
const FORCE = process.argv.includes('--force')
const RADIUS_KM = 8
const CHUNK_KM = 50
const MARGIN = 0.1

const driveSegments = routes.filter((r) => r.mode === 'drive' && r.geometryFile)

if (!driveSegments.length) {
  console.error('没有 drive 段（routes.js 需设置 geometryFile）')
  process.exit(1)
}
mkdirSync(OUT_DIR, { recursive: true })

const kmDist = (a, b) => {
  const dLat = (a.lat - b.lat) * 111
  const dLng = (a.lng - b.lng) * 111 * Math.cos((a.lat * Math.PI) / 180)
  return Math.hypot(dLat, dLng)
}

const readGeom = (file) => {
  const g = JSON.parse(readFileSync(join(ROUTES_DIR, file), 'utf8'))
  return (g.coordinates || []).map(([lng, lat]) => ({ lat, lng }))
}

function chunkRoute(points, maxKm = CHUNK_KM) {
  if (points.length < 2) return [points]
  const chunks = []
  let cur = [points[0]]
  let dist = 0
  for (let i = 1; i < points.length; i++) {
    const p = points[i]
    const d = kmDist(points[i - 1], p)
    if (dist + d > maxKm && cur.length >= 2) {
      chunks.push(cur)
      cur = [p]
      dist = 0
    } else {
      dist += d
    }
    cur.push(p)
  }
  if (cur.length) chunks.push(cur)
  return chunks
}

const bboxOf = (points, margin = MARGIN) => {
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180
  for (const p of points) {
    minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat)
    minLng = Math.min(minLng, p.lng); maxLng = Math.max(maxLng, p.lng)
  }
  return { south: minLat - margin, west: minLng - margin, north: maxLat + margin, east: maxLng + margin }
}

async function queryOnce(ep, bbox) {
  const data = `[out:json][timeout:30];(node["amenity"~"^(fuel|charging_station)$"](${bbox.south},${bbox.west},${bbox.north},${bbox.east}););out;`
  const res = await fetch(ep + '?' + new URLSearchParams({ data }), { headers: { 'User-Agent': 'tour-plan-viewer' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return json.elements || []
}

async function queryBbox(bbox) {
  let lastErr = null
  for (const ep of ENDPOINTS) {
    for (const backoff of [800, 2500, 6000, 12000]) {
      try {
        return await queryOnce(ep, bbox)
      } catch (err) {
        lastErr = err
        if (err.message.includes('429')) await new Promise((r) => setTimeout(r, backoff * 2))
        else await new Promise((r) => setTimeout(r, backoff))
      }
    }
  }
  throw lastErr
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let done = 0, skipped = 0, failed = 0

for (const seg of driveSegments) {
  const file = join(OUT_DIR, `${seg.id}.json`)
  if (!FORCE && existsSync(file)) {
    skipped++
    console.log(`[跳过] ${seg.id}.json`)
    continue
  }

  const geom = readGeom(seg.geometryFile)
  const chunks = chunkRoute(geom)
  const found = new Map()

  for (const chunk of chunks) {
    try {
      const els = await queryBbox(bboxOf(chunk))
      for (const e of els) {
        const lat = Number(e.lat)
        const lng = Number(e.lon)
        if (!isFinite(lat) || !isFinite(lng)) continue
        const type = e.tags?.amenity === 'fuel' ? 'fuel' : 'charging'
        const pt = { lat, lng }
        const near = Math.min(...geom.map((g) => kmDist(g, pt)))
        if (near > RADIUS_KM) continue
        const key = `${type}|${pt.lat.toFixed(3)}|${pt.lng.toFixed(3)}`
        if (found.has(key)) continue
        found.set(key, {
          type,
          name: e.tags?.name || e.tags?.brand || null,
          lat: +pt.lat.toFixed(5),
          lng: +pt.lng.toFixed(5),
        })
      }
    } catch (err) {
      failed++
      console.error(`  [失败] ${seg.id}: ${err.message}`)
      console.error(err.stack?.split('\n').slice(0, 4).join('\n'))
    }
    await sleep(1500)
  }

  const list = [...found.values()].sort((a, b) => (a.type === b.type ? 0 : a.type === 'fuel' ? -1 : 1))
  writeFileSync(file, JSON.stringify(list, null, 2))
  const f = list.filter((s) => s.type === 'fuel').length
  const c = list.filter((s) => s.type === 'charging').length
  done++
  console.log(`[完成] ${seg.id}.json  油 ${f} · 电 ${c}`)
}

console.log(`\n完成 ${done} 段，跳过 ${skipped} 段，失败 ${failed} 段 → ${OUT_DIR}`)
