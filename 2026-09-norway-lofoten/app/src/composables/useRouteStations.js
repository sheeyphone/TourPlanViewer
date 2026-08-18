import { ref } from 'vue'
import routes from '../data/routes.js'

export function useRouteStations() {
  const stations = ref({}) // segId -> [{ type, name, lat, lng }]
  const ready = ref(false)
  const failed = ref([])

  async function loadAll() {
    const driveRoutes = routes.filter((r) => r.mode === 'drive' && r.geometryFile)
    const entries = await Promise.all(
      driveRoutes.map(async (r) => {
        try {
          const res = await fetch(`/stations/${r.id}.json`)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const list = await res.json()
          return [r.id, list]
        } catch (err) {
          failed.value.push(r.id)
          return null
        }
      })
    )
    stations.value = Object.fromEntries(entries.filter(Boolean))
    ready.value = true
  }

  return { stations, ready, failed, loadAll }
}
