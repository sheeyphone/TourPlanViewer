export const mapConfig = {
  center: [67.9, 15.5],
  zoom: 5,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}

export const zoomShowAll = 8

export const statusLabel = {
  todo: '待定',
  planned: '已计划',
  confirmed: '已确认',
}

export const categoryLabel = {
  airport: '机场',
  city: '城市',
  hotel: '住宿',
  scenery: '景点',
  viewpoint: '观景台',
  hike: '徒步',
  ferry: '轮渡',
  food: '餐厅',
  shop: '商店',
  activity: '体验',
  fuel: '加油站',
  charging: '充电站',
}

export const categoryColor = {
  airport: '#6366f1',
  city: '#475569',
  hotel: '#0284c7',
  scenery: '#16a34a',
  viewpoint: '#ca8a04',
  hike: '#65a30d',
  ferry: '#0891b2',
  food: '#ea580c',
  shop: '#be185d',
  activity: '#7c3aed',
  fuel: '#d97706',
  charging: '#2563eb',
}

export const goColor = '#ef4444'

export const legendOrder = ['scenery', 'viewpoint', 'hike', 'activity', 'ferry', 'hotel', 'city', 'food', 'shop']

export const animConfig = {
  durationMs: 24000,
  speeds: [0.5, 1, 2],
  trail: '#0d9488',
  guideDrive: 'rgba(100,116,139,0.45)',
  guideFlight: 'rgba(168,85,247,0.45)',
  flight: '#a855f7',
  flightInactive: '#c4b5fd',
  driveActive: '#0d9488',
  driveInactive: '#94a3b8',
  driveTodo: '#64748b',
}
