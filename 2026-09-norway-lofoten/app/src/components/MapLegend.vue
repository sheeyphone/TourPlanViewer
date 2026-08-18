<script setup>
import { computed } from 'vue'
import { categoryLabel, categoryColor, goColor, legendOrder } from '../data/config.js'

const props = defineProps({
  places: { type: Array, required: true },
  routes: { type: Array, required: true },
  stations: { type: Object, default: () => ({}) },
  activeDay: { type: Number, required: true },
  stationFilter: { type: String, default: 'off' },
})

const entries = computed(() => {
  const goCount = props.places.filter((p) => p.go).length
  const cats = legendOrder
    .map((c) => ({
      label: categoryLabel[c] || c,
      color: categoryColor[c],
      count: props.places.filter((p) => p.category === c && !p.go).length,
    }))
    .filter((e) => e.count > 0)
  return { goCount, cats }
})

const stationEntry = computed(() => {
  if (props.stationFilter === 'off') return null
  const dayRoutes = props.routes.filter((r) => r.day === props.activeDay && r.mode === 'drive')
  let count = 0
  for (const r of dayRoutes) {
    for (const s of props.stations[r.id] || []) {
      if (s.type === props.stationFilter) count++
    }
  }
  const isFuel = props.stationFilter === 'fuel'
  return { label: isFuel ? '加油站' : '充电站', color: isFuel ? '#d97706' : '#2563eb', count }
})
</script>

<template>
  <div
    class="pointer-events-none absolute bottom-4 left-4 z-[600] rounded-lg border border-slate-200 bg-white/90 p-3 text-xs text-slate-600 shadow-lg backdrop-blur"
  >
    <div class="mb-1.5 flex items-center gap-1.5 font-medium text-slate-700">
      <span class="inline-block h-2.5 w-2.5 rounded-full" :style="{ background: goColor }"></span>
      必去 · {{ entries.goCount }}
    </div>
    <div class="space-y-1">
      <div v-for="e in entries.cats" :key="e.label" class="flex items-center gap-1.5">
        <span class="inline-block h-2.5 w-2.5 rounded-full" :style="{ background: e.color }"></span>
        {{ e.label }} · {{ e.count }}
      </div>
      <div v-if="stationEntry" class="mt-1.5 flex items-center gap-1.5 border-t border-slate-200 pt-1.5">
        <span class="inline-block h-2.5 w-2.5 rounded-full" :style="{ background: stationEntry.color }"></span>
        {{ stationEntry.label }} · {{ stationEntry.count }}
      </div>
    </div>
  </div>
</template>
