<script setup>
import { animConfig } from '../data/config.js'

defineProps({
  player: { type: Object, required: true },
  stationFilter: { type: String, default: 'off' },
})

const emit = defineEmits(['update:station-filter'])
</script>

<template>
  <div
    class="pointer-events-none absolute right-4 top-4 z-[600] w-64 rounded-xl border border-slate-200 bg-white/90 p-3 text-slate-700 shadow-lg backdrop-blur"
  >
    <div class="pointer-events-auto flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5">
        <button
          class="grid h-9 w-9 place-items-center rounded-lg bg-sky-600 text-base text-white transition hover:bg-sky-500"
          :title="player.status === 'playing' ? '暂停' : '播放'"
          @click="player.play()"
        >
          {{ player.status === 'playing' ? '⏸' : player.status === 'done' ? '↺' : '▶' }}
        </button>
        <button
          class="grid h-9 w-9 place-items-center rounded-lg bg-slate-200 text-base transition hover:bg-slate-300"
          title="重置"
          @click="player.stop()"
        >
          ⏹
        </button>
      </div>
      <div class="flex gap-1 rounded-lg bg-slate-100 p-0.5">
        <button
          v-for="s in animConfig.speeds"
          :key="s"
          class="rounded-md px-2 py-1 text-xs font-medium transition"
          :class="player.speed === s ? 'bg-sky-600 text-white' : 'text-slate-500 hover:text-slate-700'"
          @click="player.setSpeed(s)"
        >
          {{ s }}x
        </button>
      </div>
    </div>

    <div class="pointer-events-auto mt-2 flex items-center justify-between text-xs text-slate-500">
      <div class="flex gap-1 rounded-lg bg-slate-100 p-0.5">
        <button
          class="rounded-md px-2 py-0.5 font-medium transition"
          :class="player.scope === 'all' ? 'bg-sky-600 text-white' : 'text-slate-500'"
          @click="player.setScope('all')"
        >
          全程
        </button>
        <button
          class="rounded-md px-2 py-0.5 font-medium transition"
          :class="player.scope === 'drive' ? 'bg-sky-600 text-white' : 'text-slate-500'"
          @click="player.setScope('drive')"
        >
          自驾
        </button>
      </div>
      <span class="tabular-nums">D{{ player.currentDay ?? '–' }} · {{ Math.round(player.progress * 100) }}%</span>
    </div>

    <div class="pointer-events-auto mt-2 flex items-center justify-between text-xs text-slate-500">
      <span>沿途站点</span>
      <div class="flex gap-1 rounded-lg bg-slate-100 p-0.5">
        <button
          v-for="opt in [
            { v: 'off', t: '关' },
            { v: 'charging', t: '电', on: 'bg-sky-600 text-white' },
            { v: 'fuel', t: '油', on: 'bg-amber-600 text-white' },
          ]"
          :key="opt.v"
          class="rounded-md px-2 py-0.5 font-medium transition"
          :class="stationFilter === opt.v ? opt.on : 'text-slate-500'"
          @click="emit('update:station-filter', opt.v)"
        >
          {{ opt.t }}
        </button>
      </div>
    </div>

    <div class="pointer-events-auto mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
      <div
        class="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-[width] duration-150"
        :style="{ width: player.progress * 100 + '%' }"
      ></div>
    </div>
  </div>
</template>
