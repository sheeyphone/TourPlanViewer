import { ref } from 'vue'
import { animConfig } from '../data/config.js'

export function useJourneyPlayer({ routes, places, onFrame, onDayChange, getGeometry }) {
  const status = ref('idle') // idle | playing | paused | done
  const scope = ref('all') // all | drive
  const speed = ref(1)
  const progress = ref(0)
  const currentDay = ref(null)
  const position = ref(null)
  const segments = ref([])

  const DURATION = animConfig.durationMs

  let rafId = null
  let lastTs = 0
  let elapsed = 0
  let segIndex = 0
  let segT = 0
  let prevDay = null

  const placeById = (id) => places.find((p) => p.id === id)
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

  function buildGeom(from, to, mode, segId) {
    if (mode === 'drive' && getGeometry) {
      const real = getGeometry(segId)
      if (real && real.length >= 2) return real
    }
    const a = [from.lat, from.lng]
    const b = [to.lat, to.lng]
    if (mode !== 'flight') return [a, b]
    const dLat = b[0] - a[0]
    const dLng = b[1] - a[1]
    const len = Math.hypot(dLat, dLng)
    if (len < 1e-6) return [a, b]
    const bulge = Math.min(len * 0.16, 6)
    const nx = -dLng / len
    const ny = dLat / len
    return [a, [(a[0] + b[0]) / 2 + nx * bulge, (a[1] + b[1]) / 2 + ny * bulge], b]
  }

  function buildSegments() {
    segments.value = routes
      .map((r, i) => ({ ...r, _i: i }))
      .filter((r) => scope.value === 'all' || r.mode === 'drive')
      .sort((a, b) => a.day - b.day || a._i - b._i)
      .map((r) => {
        const from = placeById(r.from)
        const to = placeById(r.to)
        const geom = from && to ? buildGeom(from, to, r.mode, r.id) : []
        return {
          ...r,
          fromName: from?.name || r.from,
          toName: to?.name || r.to,
          geom,
          distance: geom.length ? dist(geom[0], geom[geom.length - 1]) : 0,
        }
      })
    segIndex = 0
    segT = 0
    elapsed = 0
    progress.value = 0
    currentDay.value = segments.value[0]?.day ?? null
  }

  function segPoint(geom, t) {
    let total = 0
    for (let i = 0; i < geom.length - 1; i++) total += dist(geom[i], geom[i + 1])
    if (total === 0) return geom[0]
    let target = Math.max(0, Math.min(t, 1)) * total
    for (let i = 0; i < geom.length - 1; i++) {
      const d = dist(geom[i], geom[i + 1])
      if (target <= d || i === geom.length - 2) {
        const tt = d === 0 ? 0 : target / d
        return [
          geom[i][0] + (geom[i + 1][0] - geom[i][0]) * tt,
          geom[i][1] + (geom[i + 1][1] - geom[i][1]) * tt,
        ]
      }
      target -= d
    }
    return geom[geom.length - 1]
  }

  function partialPoints(seg) {
    const g = seg.geom
    const pts = [g[0]]
    const lens = []
    let total = 0
    for (let i = 0; i < g.length - 1; i++) {
      const d = dist(g[i], g[i + 1])
      lens.push(d)
      total += d
    }
    if (total === 0) return pts
    let target = segT * total
    let acc = 0
    for (let i = 0; i < lens.length; i++) {
      if (acc + lens[i] >= target || i === lens.length - 1) {
        const tt = lens[i] === 0 ? 0 : (target - acc) / lens[i]
        pts.push([
          g[i][0] + (g[i + 1][0] - g[i][0]) * tt,
          g[i][1] + (g[i + 1][1] - g[i][1]) * tt,
        ])
        break
      }
      acc += lens[i]
      pts.push(g[i + 1])
    }
    return pts
  }

  function buildTrail() {
    const pts = []
    for (let i = 0; i <= segIndex; i++) {
      const seg = segments.value[i]
      if (i < segIndex) pts.push(...seg.geom)
      else pts.push(...partialPoints(seg))
    }
    return pts
  }

  function step(t01) {
    const total = segments.value.reduce((s, x) => s + x.distance, 0)
    let rem = t01 * total
    for (let i = 0; i < segments.value.length; i++) {
      const d = segments.value[i].distance
      if (rem <= d || i === segments.value.length - 1) {
        segIndex = i
        segT = d === 0 ? 1 : rem / d
        return
      }
      rem -= d
    }
  }

  function emitFrame() {
    const seg = segments.value[segIndex]
    if (!seg) return
    const p = segPoint(seg.geom, segT)
    position.value = p
    if (seg.day !== prevDay) {
      prevDay = seg.day
      currentDay.value = seg.day
      onDayChange?.(seg.day)
    }
    onFrame?.({ position: p, day: seg.day, trail: buildTrail() })
  }

  function loop(ts) {
    if (rafId == null) return
    const dt = ts - lastTs
    lastTs = ts
    elapsed += dt * speed.value
    progress.value = Math.min(1, elapsed / DURATION)
    if (progress.value >= 1) {
      progress.value = 1
      step(1)
      status.value = 'done'
      rafId = null
      emitFrame()
      return
    }
    step(progress.value)
    emitFrame()
    rafId = requestAnimationFrame(loop)
  }

  function play() {
    if (status.value === 'playing') {
      pause()
      return
    }
    if (status.value === 'done') buildSegments()
    status.value = 'playing'
    prevDay = null
    lastTs = performance.now()
    rafId = requestAnimationFrame(loop)
  }

  function pause() {
    if (status.value !== 'playing') return
    status.value = 'paused'
    rafId = null
  }

  function stop() {
    rafId = null
    buildSegments()
    status.value = 'idle'
    position.value = segments.value.length ? segments.value[0].geom[0] : null
  }

  function setScope(s) {
    scope.value = s
    stop()
  }

  function setSpeed(s) {
    speed.value = s
  }

  return { status, scope, speed, progress, currentDay, position, segments, play, pause, stop, setScope, setSpeed }
}
