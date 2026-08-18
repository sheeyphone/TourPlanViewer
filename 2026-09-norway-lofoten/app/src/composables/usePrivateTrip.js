import { ref } from 'vue'
import baseItinerary from '../data/itinerary.js'
import basePlaces from '../data/places.js'
import baseRoutes from '../data/routes.js'

const clone = (arr) => arr.map((x) => ({ ...x }))

export function usePrivateTrip() {
  const itinerary = ref(clone(baseItinerary))
  const places = ref(clone(basePlaces))
  const routes = ref(clone(baseRoutes))
  const ready = ref(false)
  const hasPrivate = ref(false)

  async function load() {
    try {
      const res = await fetch('/trip.json')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      for (const [day, t] of Object.entries(data.transport || {})) {
        const d = itinerary.value.find((x) => x.day === Number(day))
        if (d) d.transport = t
      }
      for (const [day, h] of Object.entries(data.hotels || {})) {
        const d = itinerary.value.find((x) => x.day === Number(day))
        if (d) d.hotel = h
      }
      for (const [day, n] of Object.entries(data.notes || {})) {
        const d = itinerary.value.find((x) => x.day === Number(day))
        if (d) d.note = n
      }
      for (const [id, f] of Object.entries(data.flights || {})) {
        const r = routes.value.find((x) => x.id === id)
        if (r) {
          if (f.note) r.note = f.note
          if (f.status) r.status = f.status
        }
      }
      places.value.push(...(data.hotelMarkers || []))

      hasPrivate.value = true
      // replace references so prop identity changes (triggers re-render in MapView)
      places.value = [...places.value]
      routes.value = [...routes.value]
    } catch (e) {
      hasPrivate.value = false
    } finally {
      ready.value = true
    }
  }

  return { itinerary, places, routes, ready, hasPrivate, load }
}
