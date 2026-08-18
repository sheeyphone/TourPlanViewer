<script setup>
import DayCard from './DayCard.vue'
import OverviewTab from './OverviewTab.vue'

defineProps({
  itinerary: { type: Array, required: true },
  routes: { type: Array, required: true },
  activeDay: { type: Number, required: true },
  viewMode: { type: String, required: true },
})

const emit = defineEmits(['select-day', 'set-view'])
</script>

<template>
  <div class="flex h-full flex-col bg-white">
    <header class="border-b border-slate-200 px-4 py-3">
      <h1 class="text-lg font-bold text-slate-900">挪威罗弗敦 · 2026</h1>
      <p class="mt-0.5 text-xs text-slate-500">2026-09-26 → 2026-10-09 · 14 天</p>
    </header>

    <nav class="flex gap-1 border-b border-slate-200 px-3 py-2">
      <button
        class="rounded-lg px-3 py-1 text-sm font-medium transition"
        :class="viewMode === 'overview' ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-slate-100'"
        @click="emit('set-view', 'overview')"
      >
        总览
      </button>
      <button
        class="rounded-lg px-3 py-1 text-sm font-medium transition"
        :class="viewMode === 'day' ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-slate-100'"
        @click="emit('set-view', 'day')"
      >
        每日
      </button>
    </nav>

    <div class="flex-1 overflow-y-auto">
      <OverviewTab
        v-if="viewMode === 'overview'"
        :itinerary="itinerary"
        :routes="routes"
        :active-day="activeDay"
        @select-day="emit('select-day', $event)"
      />
      <template v-else>
        <nav class="flex flex-wrap gap-1 border-b border-slate-200 px-3 py-2">
          <button
            v-for="item in itinerary"
            :key="item.day"
            class="rounded px-2 py-1 text-xs font-medium transition"
            :class="item.day === activeDay ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
            @click="emit('select-day', item.day)"
          >
            D{{ item.day }}
          </button>
        </nav>
        <DayCard
          v-for="item in itinerary"
          :key="item.day"
          :item="item"
          :active="item.day === activeDay"
          @click="emit('select-day', item.day)"
        />
      </template>
    </div>
  </div>
</template>
