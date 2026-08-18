import { ref } from 'vue'
import routes from '../data/routes.js'

export function useRouteGeometry() {
  const geometry = ref({})
  const ready = ref(false)
  const failed = ref([])

  async function loadAll() {
    const driveRoutes = routes.filter((r) => r.mode === 'drive' && r.geometryFile)
    const entries = await Promise.all(
      driveRoutes.map(async (r) => {
        try {
          const res = await fetch(`/routes/${r.geometryFile}`)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const geo = await res.json()
          const coords = (geo.coordinates || []).map(([lng, lat]) => [lat, lng])
          return [r.id, coords]
        } catch (err) {
          failed.value.push(r.id)
          return null
        }
      })
    )
    geometry.value = Object.fromEntries(entries.filter(Boolean))
    ready.value = true
  }

  function getGeometry(segId) {
    return geometry.value[segId] || null
  }

  return { geometry, ready, failed, loadAll, getGeometry }
}
