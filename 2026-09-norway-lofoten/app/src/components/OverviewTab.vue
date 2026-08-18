<script setup>
import { computed } from 'vue'

const props = defineProps({
  itinerary: { type: Array, required: true },
  routes: { type: Array, required: true },
  activeDay: { type: Number, required: true },
})

const emit = defineEmits(['select-day'])

const stats = computed(() => {
  const days = props.itinerary.length
  const driveDays = props.itinerary.filter((d) => d.driving).length
  const driveKm = props.routes.filter((r) => r.mode !== 'flight').reduce((s, r) => s + (r.km || 0), 0)
  const nights = props.itinerary.filter((d) => d.hotel).length
  return { days, driveDays, driveKm, nights }
})

function fmt(d) {
  if (!d) return ''
  const [, m, day] = d.split('-')
  const w = '日一二三四五六'[new Date(`${d}T00:00:00`).getDay()]
  return `${m}/${day} 周${w}`
}
</script>

<template>
  <div class="px-4 py-3">
    <div class="grid grid-cols-2 gap-2">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div class="text-2xl font-bold text-sky-600 tabular-nums">{{ stats.days }}</div>
        <div class="text-xs text-slate-500">全程天数</div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div class="text-2xl font-bold text-emerald-600 tabular-nums">
          {{ stats.driveKm }}<span class="text-sm">km</span>
        </div>
        <div class="text-xs text-slate-500">自驾里程（估）</div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div class="text-2xl font-bold text-violet-600 tabular-nums">{{ stats.driveDays }}</div>
        <div class="text-xs text-slate-500">自驾天数</div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div class="text-2xl font-bold text-slate-800 tabular-nums">{{ stats.nights }}</div>
        <div class="text-xs text-slate-500">住宿晚数</div>
      </div>
    </div>

    <ol class="relative mt-5 space-y-0 border-l border-slate-200 pl-4">
      <li v-for="item in itinerary" :key="item.day" class="relative pb-4">
        <span
          class="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full"
          :class="item.day === activeDay ? 'bg-sky-500 shadow-[0_0_0_3px_rgba(14,165,233,.2)]' : 'bg-slate-300'"
        ></span>
        <button
          class="block w-full rounded-lg px-2 py-1 text-left transition hover:bg-slate-50"
          :class="item.day === activeDay ? 'bg-slate-50' : ''"
          @click="emit('select-day', item.day)"
        >
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-sm font-semibold" :class="item.day === activeDay ? 'text-sky-700' : 'text-slate-700'">
              D{{ item.day }} · {{ item.title }}
            </span>
            <span class="shrink-0 text-xs text-slate-400">{{ fmt(item.date) }}</span>
          </div>
          <div class="mt-0.5 text-xs text-slate-500">
            {{ item.city }}
            <span v-if="item.hotel" class="ml-1 text-slate-400">· 🛏 {{ item.hotel.name }}</span>
          </div>
          <p v-if="item.driving" class="mt-0.5 truncate text-xs text-teal-600/80">🚗 {{ item.driving.detail }}</p>
          <p v-else-if="item.transport" class="mt-0.5 truncate text-xs text-violet-600/80">✈ {{ item.transport.detail }}</p>
        </button>
      </li>
    </ol>
  </div>
</template>
