export const missionMapping: Record<string, { label: Record<string, string>; icon: string }> = {
  publicSafety: {
    label: { en: 'Public Safety', zh: '公共安全' },
    icon: 'shield',
  },
  infrastructureInspection: {
    label: { en: 'Infrastructure Inspection', zh: '基础设施巡检' },
    icon: 'wrench',
  },
  mappingSurvey: {
    label: { en: 'Mapping & Survey', zh: '测绘勘察' },
    icon: 'map',
  },
  perimeterSecurity: {
    label: { en: 'Perimeter Security', zh: '周界安防' },
    icon: 'lock',
  },
  counterUas: {
    label: { en: 'Counter-UAS', zh: '反无人机' },
    icon: 'radar',
  },
  disasterResponse: {
    label: { en: 'Disaster Response', zh: '应急救援' },
    icon: 'alert-triangle',
  },
}

/**
 * Mission key to product filter mapping
 * Maps mission selector keys to category and tag filters for the products page
 */
export const MISSION_TAG_MAPPING: Record<string, { category?: string; tags?: string[] }> = {
  publicSafety: { tags: ['surveillance', 'rapid-deployment'] },
  infrastructureInspection: { tags: ['inspection', 'long-endurance'] },
  mappingSurvey: { tags: ['mapping', 'high-precision'] },
  perimeterSecurity: { tags: ['surveillance', 'long-range'] },
  counterUas: { category: 'cuas' },
  disasterResponse: { tags: ['rapid-deployment', 'search-rescue'] },
}
