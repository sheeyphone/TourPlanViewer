export default [
  { id: 'd1f', day: 1, mode: 'flight', from: 'hkg', to: 'bkk', ferry: false, status: 'planned', km: 1700, note: 'HKG → BKK（航班）' },
  { id: 'd2f', day: 2, mode: 'flight', from: 'bkk', to: 'hel', ferry: false, status: 'planned', km: 8000, note: 'BKK → HEL（航班）' },
  { id: 'd3f', day: 3, mode: 'flight', from: 'hel', to: 'oslo', ferry: false, status: 'planned', km: 870, note: 'HEL → OSL（航班）' },
  { id: 'd4f', day: 5, mode: 'flight', from: 'oslo', to: 'tos', ferry: false, status: 'planned', km: 1100, note: 'OSL → TOS（航班）' },
  { id: 'd1', day: 8, mode: 'drive', from: 'tromso', to: 'lodingen', ferry: false, status: 'todo', km: 336, geometryFile: 'd1.geojson', note: 'Tromsø → Lødingen 约 336km / 5.5h' },
  { id: 'd2', day: 9, mode: 'drive', from: 'lodingen', to: 'sorvagen', ferry: false, status: 'todo', km: 219, geometryFile: 'd2.geojson', note: '沿 E10 穿越罗弗敦（北线→南线）约 219km' },
  { id: 'd3', day: 10, mode: 'drive', from: 'sorvagen', to: 'harstad', ferry: false, status: 'todo', km: 288, geometryFile: 'd3.geojson', note: 'Sørvågen → Harstad 约 288km / 5h' },
  { id: 'd5', day: 12, mode: 'drive', from: 'harstad', to: 'tromso', ferry: false, status: 'todo', km: 309, geometryFile: 'd5.geojson', note: 'Harstad → Tromsø 约 309km / 5.1h' },
  { id: 'd12f', day: 12, mode: 'flight', from: 'tos', to: 'hel', ferry: false, status: 'planned', km: 1100, note: 'TOS → HEL（航班）' },
  { id: 'd13f', day: 13, mode: 'flight', from: 'hel', to: 'bkk', ferry: false, status: 'planned', km: 8000, note: 'HEL → BKK（航班）' },
  { id: 'd14f', day: 14, mode: 'flight', from: 'bkk', to: 'hkg', ferry: false, status: 'planned', km: 1700, note: 'BKK → HKG（航班）' },
]
