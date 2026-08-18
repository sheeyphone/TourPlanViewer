<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import L from 'leaflet'
import MapControls from './MapControls.vue'
import MapLegend from './MapLegend.vue'
import { useJourneyPlayer } from '../composables/useJourneyPlayer.js'
import { mapConfig, categoryColor, categoryLabel, statusLabel, animConfig, goColor, zoomShowAll } from '../data/config.js'

const props = defineProps({
  places: { type: Array, required: true },
  routes: { type: Array, required: true },
  activeDay: { type: Number, required: true },
  viewMode: { type: String, required: true },
  geometry: { type: Object, default: () => ({}) },
  geometryReady: { type: Boolean, default: false },
  stations: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['focus-place', 'day-change'])

const mapEl = ref(null)
const stationFilter = ref('off') // off | charging | fuel
const showAll = ref(false)
let map = null
const staticGroup = L.layerGroup()
const animGroup = L.layerGroup()

function placeById(id) {
  return props.places.find((p) => p.id === id)
}

function iconFor(place, size = 14, opacity = 1, hollow = false) {
  const color = place.go ? goColor : categoryColor[place.category] || '#94a3b8'
  const shadow = hollow ? '' : 'box-shadow:0 1px 4px rgba(15,23,42,.35);'
  return L.divIcon({
    className: 'trip-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${hollow ? 'transparent' : color};border:2px solid ${color};${shadow}opacity:${opacity}"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function routePoints(route) {
  const real = props.geometry[route.id]
  if (real && real.length >= 2) return real
  const from = placeById(route.from)
  const to = placeById(route.to)
  if (!from || !to) return null
  return [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ]
}

function popup(place) {
  const img = place.image
    ? `<img src="${place.image}" alt="${place.name}" style="width:220px;max-height:150px;object-fit:cover;border-radius:8px;display:block;margin-bottom:8px"/>`
    : ''
  const closed = place.closed
    ? `<div style="background:#fef2f2;color:#b91c1c;border:1px solid #fca5a5;border-radius:6px;padding:4px 8px;font-size:12px;font-weight:700;margin:6px 0">⚠️ 不可去：${place.closed}</div>`
    : ''
  const go = place.go ? '<span style="color:#ef4444;font-weight:600">🔴 必去</span> ' : ''
  const status = place.status ? ` · ${statusLabel[place.status] || place.status}` : ''
  return (
    img +
    closed +
    `<strong>${place.name}</strong> ${go}<br/>` +
    `${categoryLabel[place.category] || place.category}${status}` +
    (place.note ? `<br/><span style="color:#64748b">${place.note}</span>` : '')
  )
}

function fitAll() {
  const pts = props.places.map((p) => [p.lat, p.lng])
  if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.15))
}

function drawRoutes(routes, dimmed = false) {
  for (const route of routes) {
    const pts = routePoints(route)
    if (!pts) continue
    const from = placeById(route.from)
    const to = placeById(route.to)
    const isFlight = route.mode === 'flight'
    let color, weight, opacity, dashArray
    if (dimmed) {
      const isActive = route.day === props.activeDay
      color = isFlight
        ? isActive
          ? animConfig.flight
          : animConfig.flightInactive
        : isActive
          ? animConfig.driveActive
          : animConfig.driveInactive
      weight = isActive ? 3 : 2
      opacity = isActive ? 0.95 : 0.6
      dashArray = isFlight ? '6 6' : null
    } else {
      const confirmed = route.status === 'confirmed'
      color = isFlight ? animConfig.flight : confirmed ? animConfig.driveActive : animConfig.driveTodo
      weight = 4
      opacity = 0.9
      dashArray = isFlight ? '6 6' : confirmed ? null : '8 8'
    }
    L.polyline(pts, { color, weight, opacity, dashArray })
      .bindPopup(
        `<strong>Day ${route.day}</strong><br/>${from.name} → ${to.name}` +
          (route.note ? `<br/><span style="color:#94a3b8">${route.note}</span>` : '') +
          (route.ferry ? '<br/><span style="color:#22d3ee">🚢 含轮渡</span>' : '')
      )
      .addTo(staticGroup)
  }
}

function renderOverview() {
  for (const place of props.places) {
    const active = place.day === props.activeDay
    const m = L.marker([place.lat, place.lng], { icon: iconFor(place, active ? 14 : 9, active ? 1 : 0.5) })
    m.bindPopup(popup(place))
    m.on('click', () => emit('focus-place', place.id))
    m.addTo(staticGroup)
  }
  drawRoutes(props.routes, true)
}

function renderDay() {
  const day = props.activeDay
  const dayPlaces = props.places.filter((p) => p.day === day)
  const dayRoutes = props.routes.filter((r) => r.day === day)

  for (const place of dayPlaces) {
    const m = L.marker([place.lat, place.lng], { icon: iconFor(place, 14) })
    m.bindPopup(popup(place))
    m.on('click', () => emit('focus-place', place.id))
    m.addTo(staticGroup)
  }

  drawRoutes(dayRoutes)
  renderStations()
}

function renderAll() {
  for (const place of props.places) {
    const active = place.day === props.activeDay
    const m = L.marker([place.lat, place.lng], { icon: iconFor(place, active ? 14 : 10, 1, !active) })
    m.bindPopup(popup(place))
    m.on('click', () => emit('focus-place', place.id))
    m.addTo(staticGroup)
  }
  const routes = props.viewMode === 'overview' ? props.routes : props.routes.filter((r) => r.day === props.activeDay)
  drawRoutes(routes, props.viewMode === 'overview')
  renderStations()
}

function stationIcon(type) {
  const color = type === 'fuel' ? '#d97706' : '#2563eb'
  return L.divIcon({
    className: 'station-marker',
    html: `<div style="width:11px;height:11px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(15,23,42,.35)"></div>`,
    iconSize: [11, 11],
    iconAnchor: [5.5, 5.5],
  })
}

function renderStations() {
  if (props.viewMode !== 'day' || stationFilter.value === 'off') return
  const day = props.activeDay
  const dayRoutes = props.routes.filter((r) => r.day === day && r.mode === 'drive')
  for (const route of dayRoutes) {
    const list = props.stations[route.id] || []
    for (const s of list) {
      if (s.type !== stationFilter.value) continue
      const m = L.marker([s.lat, s.lng], { icon: stationIcon(s.type) })
      m.bindPopup(
        `<strong>${s.name || (s.type === 'fuel' ? '加油站' : '充电站')}</strong><br/>` +
          (s.type === 'fuel' ? '⛽ 加油站' : '🔌 充电站')
      )
      m.addTo(staticGroup)
    }
  }
}

function fitToActiveDay() {
  const day = props.activeDay
  const dayPlaces = props.places.filter((p) => p.day === day)
  const dayRoutes = props.routes.filter((r) => r.day === day)
  const pts = dayPlaces.map((p) => [p.lat, p.lng])
  for (const route of dayRoutes) {
    if (route.mode !== 'drive') continue
    const g = props.geometry[route.id]
    if (g && g.length) pts.push(...g)
    else {
      const from = placeById(route.from)
      const to = placeById(route.to)
      if (from) pts.push([from.lat, from.lng])
      if (to) pts.push([to.lat, to.lng])
    }
  }
  if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.15))
}

function renderStatic({ fit = true } = {}) {
  if (!map) return
  staticGroup.clearLayers()
  if (showAll.value) renderAll()
  else if (props.viewMode === 'overview') renderOverview()
  else renderDay()
  if (fit) {
    if (props.viewMode === 'overview') fitAll()
    else fitToActiveDay()
  }
}

function onZoomEnd() {
  const next = map.getZoom() >= zoomShowAll
  if (next !== showAll.value) {
    showAll.value = next
    if (player.status.value === 'idle') nextTick(() => renderStatic({ fit: false }))
  }
}

const player = useJourneyPlayer({
  routes: props.routes,
  places: props.places,
  getGeometry: (id) => props.geometry[id] || null,
  onFrame: (f) => {
    animGroup.clearLayers()
    drawGuide()
    drawTrail(f.trail)
    moveMarker(f.position)
    if (player.status.value === 'playing') map.panTo(f.position, { animate: false })
  },
  onDayChange: (day) => emit('day-change', day),
})

const journeyMarker = L.marker([0, 0], {
  interactive: false,
  icon: L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:9999px;background:#fff;border:4px solid #22d3ee;box-shadow:0 0 18px #22d3ee"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  }),
})

function drawGuide() {
  for (const seg of player.segments.value) {
    L.polyline(seg.geom, {
      color: seg.mode === 'flight' ? animConfig.guideFlight : animConfig.guideDrive,
      weight: 2,
      dashArray: seg.mode === 'flight' ? '6 6' : null,
    }).addTo(animGroup)
  }
}

function drawTrail(trail) {
  if (trail.length < 2) return
  L.polyline(trail, { color: animConfig.trail, weight: 4, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }).addTo(
    animGroup
  )
}

function moveMarker(pos) {
  journeyMarker.setLatLng(pos)
  journeyMarker.addTo(animGroup)
}

watch(
  () => player.status.value,
  (s) => {
    if (s === 'idle') {
      animGroup.clearLayers()
      renderStatic()
    } else if (s === 'playing' && player.progress.value === 0) {
      fitAll()
    }
  }
)

watch(
  () => [props.viewMode, props.activeDay],
  () => {
    if (player.status.value !== 'idle') return
    nextTick(renderStatic)
  }
)

watch(
  () => props.geometryReady,
  (r) => {
    if (r && player.status.value === 'idle') nextTick(renderStatic)
  }
)

watch(
  () => [props.places, props.routes],
  () => {
    if (player.status.value === 'idle') nextTick(renderStatic)
  }
)

watch(
  stationFilter,
  () => {
    if (player.status.value === 'idle') nextTick(renderStatic)
  }
)

onMounted(() => {
  map = L.map(mapEl.value, { center: mapConfig.center, zoom: mapConfig.zoom })
  L.tileLayer(mapConfig.tileUrl, { attribution: mapConfig.attribution, maxZoom: 18 }).addTo(map)
  staticGroup.addTo(map)
  animGroup.addTo(map)
  map.on('zoomend', onZoomEnd)
  renderStatic()
})

onBeforeUnmount(() => {
  player.stop()
  map?.remove()
  map = null
})
</script>

<template>
  <div class="relative h-full w-full">
    <div ref="mapEl" class="h-full w-full"></div>
    <MapControls
      :player="player"
      :station-filter="stationFilter"
      @update:station-filter="stationFilter = $event"
    />
    <MapLegend
      :places="places"
      :routes="routes"
      :stations="stations"
      :active-day="activeDay"
      :station-filter="stationFilter"
    />
  </div>
</template>

<style scoped>
:deep(.trip-marker) {
  background: transparent;
  border: none;
}
</style>
