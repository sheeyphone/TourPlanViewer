export default [
  { id: 'd1f', day: 1, mode: 'flight', from: 'hkg', to: 'bkk', ferry: false, status: 'planned', km: 1700, note: 'HKG → BKK（航班）' },
  { id: 'd2f', day: 2, mode: 'flight', from: 'bkk', to: 'hel', ferry: false, status: 'planned', km: 8000, note: 'BKK → HEL（航班）' },
  { id: 'd3f', day: 3, mode: 'flight', from: 'hel', to: 'oslo', ferry: false, status: 'planned', km: 870, note: 'HEL → OSL（航班）' },
  { id: 'd4f', day: 5, mode: 'flight', from: 'oslo', to: 'tos', ferry: false, status: 'planned', km: 1100, note: 'OSL → TOS（航班）' },
  { id: 'd1', day: 7, mode: 'drive', from: 'tromso', to: 'lodingen', ferry: false, status: 'todo', km: 336, geometryFile: 'd1.geojson', note: 'Tromsø → Lødingen 约 336km / 5.5h' },
  { id: 'd2', day: 8, mode: 'drive', from: 'lodingen', to: 'reine', ferry: false, status: 'todo', km: 221, geometryFile: 'd2.geojson', note: '沿 E10 穿越罗弗敦（北线→南线）约 221km，夜宿雷讷' },
  { id: 'd3', day: 10, mode: 'drive', from: 'reine', to: 'harstad', ferry: false, status: 'todo', km: 290, geometryFile: 'd3.geojson', note: 'Reine → Harstad 约 290km / 5h' },
  { id: 'd4', day: 11, mode: 'drive', from: 'harstad', to: 'silsand', ferry: false, status: 'todo', km: 131, via: [[16.591, 68.7769], [16.8513, 68.7264]], overview: 'full', geometryFile: 'd4.geojson', note: 'Harstad → Stangnes 渡轮 → Sørrollnes → Silsand（约118km路 + 40min渡轮）' },
  { id: 'd5', day: 12, mode: 'drive', from: 'silsand', to: 'tromso', ferry: false, status: 'todo', km: 121, via: [[17.9087, 69.5069], [18.0319, 69.6078]], overview: 'full', geometryFile: 'd5.geojson', note: 'Senja → Botnhamn 渡轮 → Brensholmen → Tromsø（约107km路 + 40min渡轮）' },
  { id: 'd12f', day: 12, mode: 'flight', from: 'tos', to: 'hel', ferry: false, status: 'planned', km: 1100, note: 'TOS → HEL（航班）' },
  { id: 'd13f', day: 13, mode: 'flight', from: 'hel', to: 'bkk', ferry: false, status: 'planned', km: 8000, note: 'HEL → BKK（航班）' },
  { id: 'd14f', day: 14, mode: 'flight', from: 'bkk', to: 'hkg', ferry: false, status: 'planned', km: 1700, note: 'BKK → HKG（航班）' },
]
