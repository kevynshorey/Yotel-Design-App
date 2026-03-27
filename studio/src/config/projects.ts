import type { ProjectId } from '@/engine/types'

export const PROJECTS: Record<ProjectId, { name: string; description: string }> = {
  'carlisle-bay': {
    name: 'YOTEL + YOTELPAD Carlisle Bay',
    description: '130 keys | Bridgetown | YOTEL city + YOTELPAD extended-stay',
  },
  'abbeville': {
    name: 'YOTELPAD Abbeville',
    description: '60 units | Worthing | 4 towers | YOTELPAD resort',
  },
  'mt-brevitor': {
    name: 'Mt Brevitor Estates',
    description: '485 units | 120 acres | X Range · Farming · 7 Clusters · Heritage | St Peter',
  },
}
