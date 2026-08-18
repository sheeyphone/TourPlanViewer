<script setup>
defineProps({
  item: { type: Object, required: true },
  active: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

function fmtDate(d) {
  if (!d) return ''
  const [, m, day] = d.split('-')
  const w = '日一二三四五六'[new Date(`${d}T00:00:00`).getDay()]
  return `${m}/${day} 周${w}`
}
</script>

<template>
  <article
    class="cursor-pointer border-b border-slate-100 px-4 py-3 transition-colors"
    :class="active ? 'bg-sky-50' : 'hover:bg-slate-50'"
    @click="emit('click')"
  >
    <div class="flex items-baseline justify-between gap-2">
      <h2 class="text-sm font-semibold" :class="active ? 'text-sky-700' : 'text-slate-800'">
        <span class="mr-1 text-teal-600">D{{ item.day }}</span>
        {{ item.title }}
      </h2>
      <span class="shrink-0 text-xs text-slate-400">{{ fmtDate(item.date) }}</span>
    </div>
    <p class="mt-0.5 text-xs text-slate-500">{{ item.city }}</p>

    <p v-if="!active && (item.transport || item.driving)" class="mt-0.5 truncate text-xs text-slate-400">
      {{ item.transport?.detail || item.driving?.detail }}
    </p>

    <div v-if="active" class="mt-2 space-y-1.5 text-xs">
      <div v-if="item.transport" class="flex gap-1.5">
        <span class="w-8 shrink-0 font-medium text-slate-500">交通</span>
        <span class="text-slate-700">
          {{ item.transport.detail }}
          <span v-if="item.transport.status === 'todo'" class="ml-1 rounded bg-amber-100 px-1 py-0.5 text-amber-700"
            >待定</span
          >
        </span>
      </div>

      <div v-if="item.activities.length" class="flex gap-1.5">
        <span class="w-8 shrink-0 font-medium text-slate-500">活动</span>
        <ul class="list-disc space-y-0.5 pl-4 text-slate-700">
          <li v-for="(a, i) in item.activities" :key="i">{{ a }}</li>
        </ul>
      </div>

      <div v-if="item.driving" class="flex gap-1.5">
        <span class="w-8 shrink-0 font-medium text-slate-500">车程</span>
        <span class="text-slate-700">
          {{ item.driving.detail }}
          <span v-if="item.driving.status === 'todo'" class="ml-1 rounded bg-amber-100 px-1 py-0.5 text-amber-700"
            >待定</span
          >
        </span>
      </div>

      <div v-if="item.hotel" class="flex gap-1.5">
        <span class="w-8 shrink-0 font-medium text-slate-500">住宿</span>
        <span class="text-slate-700">
          {{ item.hotel.name }}
          <span v-if="item.hotel.status === 'todo'" class="ml-1 rounded bg-amber-100 px-1 py-0.5 text-amber-700"
            >待定</span
          >
        </span>
      </div>

      <div v-if="item.note" class="flex gap-1.5">
        <span class="w-8 shrink-0 font-medium text-slate-500">备注</span>
        <span class="text-slate-500">{{ item.note }}</span>
      </div>
    </div>
  </article>
</template>
