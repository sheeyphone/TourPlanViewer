<script setup>
import { ref, computed, onMounted } from 'vue'
import MapView from './components/MapView.vue'
import RoadbookSidebar from './components/RoadbookSidebar.vue'
import { usePrivateTrip } from './composables/usePrivateTrip.js'
import { useRouteGeometry } from './composables/useRouteGeometry.js'
import { useRouteStations } from './composables/useRouteStations.js'

const trip = usePrivateTrip()
const activeDay = ref(1)
const viewMode = ref('overview')
const routeGeom = useRouteGeometry()
const routeStations = useRouteStations()

const stats = computed(() => {
  const days = trip.itinerary.value.length
  const driveDays = trip.itinerary.value.filter((d) => d.driving).length
  const driveKm = trip.routes.value.filter((r) => r.mode !== 'flight').reduce((s, r) => s + (r.km || 0), 0)
  return { days, driveDays, driveKm }
})

function focusDay(day) {
  activeDay.value = day
  viewMode.value = 'day'
}

function setView(mode) {
  viewMode.value = mode
}

function onDayChange(day) {
  activeDay.value = day
}

function focusPlace(id) {
  const p = trip.places.value.find((x) => x.id === id)
  if (p) {
    activeDay.value = p.day
    viewMode.value = 'day'
  }
}

onMounted(() => {
  trip.load()
  routeGeom.loadAll()
  routeStations.loadAll()
})
</script>

<template>
  <div class="flex h-full w-full flex-col overflow-hidden bg-slate-100 text-slate-800">
    <div
      v-if="trip.ready.value && !trip.hasPrivate.value"
      class="border-b border-amber-300 bg-amber-50 px-5 py-2 text-xs text-amber-800"
    >
      ⚠️ Private trip data (flights / hotels) not found — place <code class="font-mono">app/public/trip.json</code> and
      refresh to load it. Showing the public skeleton only.
    </div>

    <header class="flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-5 py-3 backdrop-blur">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Norway Lofoten · Aurora Trip</h1>
        <p class="mt-0.5 text-xs text-slate-500">
          2026-09-26 → 10-09 · Helsinki · Oslo · Tromsø · Lofoten
        </p>
      </div>
      <div class="flex items-center gap-2">
        <div class="hidden rounded-lg border border-slate-200 bg-white px-3 py-1 text-center md:block">
          <div class="text-sm font-bold text-sky-600 tabular-nums">{{ stats.days }}</div>
          <div class="text-[10px] text-slate-400">days</div>
        </div>
        <div class="hidden rounded-lg border border-slate-200 bg-white px-3 py-1 text-center md:block">
          <div class="text-sm font-bold text-emerald-600 tabular-nums">{{ stats.driveKm }}km</div>
          <div class="text-[10px] text-slate-400">driving</div>
        </div>
        <div class="hidden rounded-lg border border-slate-200 bg-white px-3 py-1 text-center md:block">
          <div class="text-sm font-bold text-violet-600 tabular-nums">{{ stats.driveDays }}</div>
          <div class="text-[10px] text-slate-400">drive days</div>
        </div>
        <div class="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            class="rounded-md px-3 py-1 text-sm font-medium transition"
            :class="viewMode === 'overview' ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-slate-100'"
            @click="setView('overview')"
          >
            Overview
          </button>
          <button
            class="rounded-md px-3 py-1 text-sm font-medium transition"
            :class="viewMode === 'day' ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-slate-100'"
            @click="setView('day')"
          >
            Day
          </button>
        </div>
      </div>
    </header>

    <div class="flex min-h-0 flex-1">
      <div class="relative h-full w-2/3">
        <MapView
          :places="trip.places.value"
          :routes="trip.routes.value"
          :active-day="activeDay"
          :view-mode="viewMode"
          :geometry="routeGeom.geometry.value"
          :geometry-ready="routeGeom.ready.value"
          :stations="routeStations.stations.value"
          @focus-place="focusPlace"
          @day-change="onDayChange"
        />
      </div>
      <div class="h-full w-1/3 border-l border-slate-200">
        <RoadbookSidebar
          :itinerary="trip.itinerary.value"
          :routes="trip.routes.value"
          :active-day="activeDay"
          :view-mode="viewMode"
          @select-day="focusDay"
          @set-view="setView"
        />
      </div>
    </div>
  </div>
</template>
